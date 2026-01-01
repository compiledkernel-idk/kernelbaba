/* ========================================
   KERNELBABA - Interactive Effects
   ======================================== */

// Load content from JSON
async function loadContent() {
    try {
        const response = await fetch('content.json');
        const content = await response.json();
        applyContent(content);
    } catch (error) {
        console.log('Using default content (content.json not loaded)');
    }
}

function applyContent(c) {
    // Meta
    document.title = c.meta?.title || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && c.meta?.description) metaDesc.content = c.meta.description;

    // Hero
    const badge = document.querySelector('.hero-badge span:last-child');
    if (badge && c.hero?.badge) badge.textContent = c.hero.badge;

    const titleLines = document.querySelectorAll('.title-line');
    if (titleLines.length >= 2 && c.hero?.title) {
        updateLetters(titleLines[0], c.hero.title[0]);
        updateLetters(titleLines[1], c.hero.title[1]);
    }

    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle && c.hero?.subtitle) {
        subtitle.innerHTML = `${c.hero.subtitle}<br><span class="highlight">${c.hero.subtitleHighlight}</span>`;
    }

    const ctaPrimary = document.querySelector('.btn-primary span');
    if (ctaPrimary && c.hero?.ctaPrimary) ctaPrimary.textContent = c.hero.ctaPrimary;

    const ctaSecondary = document.querySelector('.btn-ghost span');
    if (ctaSecondary && c.hero?.ctaSecondary) ctaSecondary.textContent = c.hero.ctaSecondary;

    const scrollText = document.querySelector('.scroll-indicator span');
    if (scrollText && c.hero?.scrollText) scrollText.textContent = c.hero.scrollText;

    if (c.hero?.githubUrl) {
        const githubBtn = document.querySelector('a[href*="github.com"]');
        if (githubBtn) githubBtn.href = c.hero.githubUrl;
    }

    // About
    const aboutNum = document.querySelector('.about .section-number');
    if (aboutNum && c.about?.sectionNumber) aboutNum.textContent = c.about.sectionNumber;

    const aboutTitle = document.querySelector('.about .section-title');
    if (aboutTitle && c.about?.sectionTitle) aboutTitle.textContent = c.about.sectionTitle;

    const aboutIntro = document.querySelector('.about-intro');
    if (aboutIntro && c.about?.intro) aboutIntro.innerHTML = c.about.intro;

    const aboutParagraphs = document.querySelectorAll('.about-text > p:not(.about-intro)');
    if (c.about?.paragraphs) {
        aboutParagraphs.forEach((p, i) => {
            if (c.about.paragraphs[i]) p.innerHTML = c.about.paragraphs[i];
        });
    }

    const statItems = document.querySelectorAll('.stat-item');
    if (c.about?.stats) {
        statItems.forEach((item, i) => {
            if (c.about.stats[i]) {
                item.querySelector('.stat-value').textContent = c.about.stats[i].value;
                item.querySelector('.stat-label').textContent = c.about.stats[i].label;
            }
        });
    }

    // Projects
    const projectsNum = document.querySelector('.projects .section-number');
    if (projectsNum && c.projects?.sectionNumber) projectsNum.textContent = c.projects.sectionNumber;

    const projectsTitle = document.querySelector('.projects .section-title');
    if (projectsTitle && c.projects?.sectionTitle) projectsTitle.textContent = c.projects.sectionTitle;

    // Featured Project
    if (c.projects?.featured) {
        const featuredCard = document.querySelector('.project-card.featured');
        if (featuredCard) {
            const fTitle = featuredCard.querySelector('.project-title');
            const fDesc = featuredCard.querySelector('.project-description');
            const fLink = featuredCard.querySelector('.project-link');

            if (fTitle) fTitle.textContent = c.projects.featured.title;
            if (fDesc) fDesc.textContent = c.projects.featured.description;
            if (fLink && c.projects.featured.link) fLink.href = c.projects.featured.link;

            // Tags
            if (c.projects.featured.tags) {
                const tagsContainer = featuredCard.querySelector('.project-tags');
                // Preserve the star tag if possible, or just rebuild
                // specific logic can be added here if needed
            }
        }
    }

    // Grid Projects
    if (c.projects?.items) {
        const projectCards = document.querySelectorAll('.projects-grid .project-card:not(.more-projects)');
        projectCards.forEach((card, i) => {
            if (c.projects.items[i]) {
                const item = c.projects.items[i];
                const pTitle = card.querySelector('.project-title');
                const pDesc = card.querySelector('.project-description');
                const pLink = card.querySelector('.project-link');

                if (pTitle) pTitle.textContent = item.title;
                if (pDesc) pDesc.textContent = item.description;
                if (pLink && item.link) pLink.href = item.link;
            }
        });
    }

    // Footer
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo && c.footer?.brand) footerLogo.textContent = c.footer.brand;

    const footerTagline = document.querySelector('.footer-brand p');
    if (footerTagline && c.footer?.tagline) footerTagline.textContent = c.footer.tagline;

    const footerCopy = document.querySelector('.footer-bottom p');
    if (footerCopy && c.footer?.copyright) footerCopy.textContent = c.footer.copyright;
}

function updateLetters(container, text) {
    container.innerHTML = text.split('').map((letter, i) =>
        `<span class="letter" style="--i:${i}">${letter}</span>`
    ).join('');
}

// Load content on page load
loadContent();

// Mouse position tracking
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetX = mouseX;
let targetY = mouseY;

// Cursor elements
const cursorGlow = document.getElementById('cursor-glow');
const cursorTrail = document.getElementById('cursor-trail');
const orb1 = document.getElementById('orb-1');
const orb2 = document.getElementById('orb-2');
const orb3 = document.getElementById('orb-3');

// Orb positions with different easing
const orbs = [
    { el: orb1, x: 0, y: 0, speed: 0.08, offsetX: 40, offsetY: 30 },
    { el: orb2, x: 0, y: 0, speed: 0.05, offsetX: -60, offsetY: -40 },
    { el: orb3, x: 0, y: 0, speed: 0.12, offsetX: 30, offsetY: -50 }
];

// Track mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Update CSS variables for gradient following
    const percentX = (mouseX / window.innerWidth) * 100;
    const percentY = (mouseY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--cursor-x', `${percentX}%`);
    document.documentElement.style.setProperty('--cursor-y', `${percentY}%`);
    document.documentElement.style.setProperty('--mouse-x', mouseX / window.innerWidth);
    document.documentElement.style.setProperty('--mouse-y', mouseY / window.innerHeight);
});

// Animation loop for cursor effects
function animateCursor() {
    // Smooth follow for main cursor
    targetX += (mouseX - targetX) * 0.15;
    targetY += (mouseY - targetY) * 0.15;

    if (cursorGlow) {
        cursorGlow.style.left = `${targetX}px`;
        cursorGlow.style.top = `${targetY}px`;
    }

    if (cursorTrail) {
        cursorTrail.style.left = `${mouseX}px`;
        cursorTrail.style.top = `${mouseY}px`;
    }

    // Animate orbs with physics-based easing
    orbs.forEach(orb => {
        const targetOrbX = mouseX + orb.offsetX + Math.sin(Date.now() * 0.002) * 20;
        const targetOrbY = mouseY + orb.offsetY + Math.cos(Date.now() * 0.002) * 20;

        orb.x += (targetOrbX - orb.x) * orb.speed;
        orb.y += (targetOrbY - orb.y) * orb.speed;

        if (orb.el) {
            orb.el.style.left = `${orb.x}px`;
            orb.el.style.top = `${orb.y}px`;
        }
    });

    requestAnimationFrame(animateCursor);
}

animateCursor();

// Create floating particles
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random properties - grayscale
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 15 + 15;
        const brightness = Math.random() * 30 + 40; // 40-70%

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            background: hsl(0, 0%, ${brightness}%);
            box-shadow: 0 0 ${size * 2}px hsl(0, 0%, ${brightness}%);
        `;

        container.appendChild(particle);
    }
}

createParticles();

// Canvas shader background - subtle grayscale
function initShaderBackground() {
    const canvas = document.getElementById('shader-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
        time += 0.003;

        // Clear with dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle moving gradients
        for (let i = 0; i < 2; i++) {
            const x = canvas.width * (0.3 + Math.sin(time + i * 3) * 0.4);
            const y = canvas.height * (0.4 + Math.cos(time * 0.6 + i * 2) * 0.3);
            const radius = 200 + Math.sin(time * 2 + i) * 50;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    draw();
}

initShaderBackground();

// Scroll reveal animations
function initScrollReveal() {
    const elements = document.querySelectorAll('.section, .game-card, .about-content');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-50px'
    });

    elements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

initScrollReveal();

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Tilt effect for cards
function initTiltEffect() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

initTiltEffect();

// Letter hover effect
document.querySelectorAll('.letter').forEach(letter => {
    letter.addEventListener('mouseenter', () => {
        letter.style.transform = 'translateY(-10px) scale(1.2)';
        letter.style.filter = 'drop-shadow(0 0 40px var(--color-accent-primary))';
    });

    letter.addEventListener('mouseleave', () => {
        letter.style.transform = '';
        letter.style.filter = '';
    });
});

// Make entire project cards clickable
document.querySelectorAll('.project-card').forEach(card => {
    card.style.cursor = 'none'; // Ensure custom cursor is used

    card.addEventListener('click', (e) => {
        // Don't trigger if clicking exactly on the link (let default generic link behavior handle it)
        if (e.target.closest('a')) return;

        const link = card.querySelector('a');
        if (link && link.href) {
            window.open(link.href, '_blank');
        }
    });
});

// Dynamic glow on cards following mouse
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.left = `${x - rect.width}px`;
            glow.style.top = `${y - rect.height}px`;
        }
    });
});

console.log('Kernelbaba website loaded');
