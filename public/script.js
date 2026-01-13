/* ========================================
   KERNELBABA - Terminal Theme JavaScript
   with Locomotive Scroll
   ======================================== */

// Translations
const translations = {
    en: {
        'hero.subtitle': 'Software, games and tools.',
        'hero.highlight': 'Open source. Made with ♥',
        'hero.projects': 'Projects',
        'about.title': 'about.txt',
        'about.intro': 'I am',
        'about.p1': 'I share software, games and tools on GitHub.',
        'about.p2': 'From package managers to games in Assembly.',
        'footer.about': '[About]',
        'footer.projects': '[Projects]'
    },
    nl: {
        'hero.subtitle': 'Software, games en tools.',
        'hero.highlight': 'Open source. Gemaakt met ♥',
        'hero.projects': 'Projecten',
        'about.title': 'over.txt',
        'about.intro': 'Ik ben',
        'about.p1': 'Ik deel software, games en tools op GitHub.',
        'about.p2': 'Van package managers tot games in Assembly.',
        'footer.about': '[Over]',
        'footer.projects': '[Projecten]'
    }
};

let currentLang = localStorage.getItem('lang') || 'en';
let scroll = null;

function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    localStorage.setItem('lang', lang);
    currentLang = lang;

    // Update scroll after content change
    if (scroll) scroll.update();
}

// Typing animation
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Generic typing reveal
function typeReveal(element, speed = 10) {
    if (element.dataset.typing === 'true' || element.dataset.typed === 'true') return;

    element.dataset.typing = 'true';
    const text = element.getAttribute('data-text-original') || element.textContent;

    // Save original text if not already saved
    if (!element.getAttribute('data-text-original')) {
        element.setAttribute('data-text-original', text);
    }

    element.textContent = '';
    element.style.opacity = '1';

    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.dataset.typing = 'false';
            element.dataset.typed = 'true';
        }
    }
    type();
}

// Init Scroll Observer
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-inview');
                if (entry.target.classList.contains('typing-reveal')) {
                    const speed = parseInt(entry.target.getAttribute('data-typing-speed')) || 10;
                    typeReveal(entry.target, speed);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.window-wrapper, .typing-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Init Scroll Observer
    initScrollObserver();

    // Language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang !== currentLang) applyTranslations(lang);
        });
    });
    applyTranslations(currentLang);

    // Typing effect on subtitle
    const subtitle = document.querySelector('.command[data-i18n="hero.subtitle"]');
    if (subtitle) {
        const text = subtitle.textContent;
        setTimeout(() => typeWriter(subtitle, text, 40), 500);
    }

    // Clock
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const timeString = `${hours}:${minutes} ${ampm}`;
        const clock = document.querySelector('.clock');
        if (clock) clock.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    console.log('$ kernelbaba windows 98 loaded');
    console.log('$ locomotive-scroll initialized');
});
