const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    maxHttpBufferSize: 1e6 // 1MB limit for image uploads
});
const path = require('path');
const fs = require('fs');

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Store message history, bans, and timeouts
let messages = [];
const MAX_HISTORY = 50;
const bannedIPs = new Set();
// Timeouts: { username: timestamp_until }
let timeouts = {};

// Use /tmp for writable storage on cloud platforms (ephemeral but writable)
const USERS_FILE = path.join('/tmp', 'users.json');

// Active activeSessions: { socketId: { username, role, ip } }
let users = {};
// Persistent accounts: { username: { password, role } }
let accounts = {};

// Load accounts
if (fs.existsSync(USERS_FILE)) {
    try { 
        accounts = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); 
        console.log("Loaded accounts from " + USERS_FILE);
    } catch (e) { 
        console.error("Error loading accounts:", e.message);
    }
} else {
    // Initial owner account
    accounts['owner'] = { password: 'Berkaykaplan@12', role: 'owner' };
    saveAccounts();
}

function saveAccounts() {
    try { 
        fs.writeFileSync(USERS_FILE, JSON.stringify(accounts, null, 2)); 
    } catch (e) { 
        console.error("Error saving accounts (running in memory-only mode):", e.message);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;

    // Reject banned users
    if (bannedIPs.has(clientIp)) {
        socket.emit('login_error', 'You are banned from this server.');
        socket.disconnect();
        return;
    }

    // Send history continuously
    socket.emit('history', messages);

    socket.on('attempt_login', (data) => {
        const { username, password } = data;
        const cleanName = username ? username.trim() : '';
        const userId = cleanName.toLowerCase();

        if (!cleanName || !password) {
            socket.emit('login_error', 'Username and password required.');
            return;
        }

        // 1. Check if already online
        const isOnline = Object.values(users).some(u => u.username.toLowerCase() === userId);
        if (isOnline) {
            socket.emit('login_error', 'User is already logged in.');
            return;
        }

        // 2. Authenticate or Register
        let role = 'user';

        if (accounts[userId]) {
            // LOGIN: Check password
            if (accounts[userId].password !== password) {
                socket.emit('login_error', 'Incorrect password.');
                return;
            }
            role = accounts[userId].role;
        } else {
            // REGISTER: Create new user
            if (userId === 'owner') {
                socket.emit('login_error', 'Reserved name.');
                return;
            }
            accounts[userId] = { password: password, role: 'user' };
            saveAccounts();
            socket.emit('login_success_msg', 'Account created! Logging in...');
        }

        // 3. Success
        users[socket.id] = { username: cleanName, role, ip: clientIp };
        socket.emit('login_success', { username: cleanName, role });

        io.emit('system_message', { text: `${cleanName} has joined the chat.` });
        io.emit('update_users', Object.values(users));
    });

    socket.on('chat_message', (msg) => {
        const user = users[socket.id];
        if (!user) return;

        // Check Timeout
        if (timeouts[user.username] && timeouts[user.username] > Date.now()) {
            const left = Math.ceil((timeouts[user.username] - Date.now()) / 1000);
            socket.emit('login_success_msg', `You are timed out for ${left}s.`); // Reuse msg channel
            return;
        }

        const messageData = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            user: user.username,
            role: user.role,
            type: 'text',
            text: msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        messages.push(messageData);
        if (messages.length > MAX_HISTORY) messages.shift();

        io.emit('chat_message', messageData);
    });

    socket.on('image_message', (base64) => {
        const user = users[socket.id];
        if (!user) return;

        // Check Timeout
        if (timeouts[user.username] && timeouts[user.username] > Date.now()) {
            return;
        }

        const messageData = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            user: user.username,
            role: user.role,
            type: 'image',
            text: base64, // We reuse 'text' field for payload
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        messages.push(messageData);
        if (messages.length > MAX_HISTORY) messages.shift();

        io.emit('chat_message', messageData);
    });

    // --- Owner Actions ---

    socket.on('delete_message', (msgId) => {
        const user = users[socket.id];
        console.log(`[DELETE] Request from ${user?.username} (${user?.role}) for msg ${msgId}`);
        if (user && user.role === 'owner') {
            const prevLen = messages.length;
            messages = messages.filter(m => m.id !== msgId);
            if (messages.length !== prevLen) {
                io.emit('message_deleted', msgId);
                io.emit('history', messages);
            }
        }
    });

    socket.on('ban_user', (targetUsername) => {
        const user = users[socket.id];
        console.log(`[BAN] Request from ${user?.username} to ban ${targetUsername}`);
        if (user && user.role === 'owner') {
            const targetSocketId = Object.keys(users).find(id => users[id].username === targetUsername);
            if (targetSocketId) {
                const target = users[targetSocketId];
                bannedIPs.add(target.ip);
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.emit('login_error', 'You have been banned by the owner.');
                    targetSocket.disconnect();
                }
                io.emit('system_message', { text: `${targetUsername} has been banned.` });
            }
        }
    });

    socket.on('kick_user', (targetUsername) => {
        const user = users[socket.id];
        console.log(`[KICK] Request from ${user?.username} to kick ${targetUsername}`);
        if (user && user.role === 'owner') {
            const targetSocketId = Object.keys(users).find(id => users[id].username === targetUsername);
            if (targetSocketId) {
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.emit('login_error', 'You have been kicked by the owner.');
                    targetSocket.disconnect();
                }
                io.emit('system_message', { text: `${targetUsername} has been kicked.` });
            }
        }
    });

    socket.on('timeout_user', (data) => {
        const { username: targetUsername, duration } = data; // duration in seconds
        const user = users[socket.id];
        console.log(`[TIMEOUT] Request from ${user?.username} to timeout ${targetUsername} for ${duration}s`);

        if (user && user.role === 'owner') {
            const ms = duration * 1000;
            timeouts[targetUsername] = Date.now() + ms;
            io.emit('system_message', { text: `${targetUsername} has been muted for ${duration} seconds.` });
        }
    });

    // ---------------------

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            delete users[socket.id];
            // io.emit('system_message', { text: `${user.username} has left the chat.` }); 
            // Commented out "left" message to reduce spam if users refresh often
            io.emit('update_users', Object.values(users));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
