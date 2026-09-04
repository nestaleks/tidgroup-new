/**
 * Premium animations for TID Group website
 * Using GSAP for sophisticated interactions and effects
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initPremiumAnimations();
});

/**
 * Main animation initialization function
 */
function initPremiumAnimations() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        return;
    }

    initHeaderAnimations();
    initHeroAnimations();
    initScrollAnimations();
    initHoverAnimations();
    initPageLoadAnimations();
}

/**
 * Header animations
 */
function initHeaderAnimations() {
    // The scrolled state of the header is handled in CSS (.header.scrolled)
    // and toggled from main.js, so every page behaves the same way -
    // not only the pages that load GSAP.
}

/**
 * Hero section premium animations
 */
function initHeroAnimations() {
    const heroTitle = document.querySelector('.top__title');
    if (heroTitle) {
        gsap.from(heroTitle, {
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.5
        });
    }

    const scrollIndicator = document.querySelector('.scroll');
    if (scrollIndicator) {
        gsap.to(scrollIndicator, {
            y: -20,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });
    }
}

/**
 * Scroll-triggered animations for content sections
 */
function initScrollAnimations() {
    // Анимация секций целиком через их контейнеры
    const sections = document.querySelectorAll('.section__padding');
    
    sections.forEach(section => {
        const container = section.querySelector('.container');
        if (container) {
            gsap.from(container, {
                y: 60,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%', // Когда верх секции на 85% высоты экрана
                    toggleActions: 'play none none none', // Играть один раз при входе
                    once: true
                }
            });
        }
    });

    // Анимация заголовков
    const sectionTitles = document.querySelectorAll('.section__title, .pretitle');
    sectionTitles.forEach(title => {
        gsap.from(title, {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 90%',
                once: true
            }
        });
    });

    // Карточки проектов
    const projectCards = document.querySelectorAll('.projects__item, .inprogress__item');
    projectCards.forEach((card, index) => {
        gsap.from(card, {
            y: 40,
            opacity: 0,
            scale: 0.95,
            duration: 1,
            delay: (index % 3) * 0.1, // Небольшая задержка для ряда
            ease: 'power2.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                once: true
            }
        });
    });

    // Направления (Direction items)
    const directionItems = document.querySelectorAll('.direction__item');
    directionItems.forEach((item, index) => {
        const isEven = index % 2 === 0;
        gsap.from(item, {
            x: isEven ? -50 : 50,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                once: true
            }
        });
    });
}

/**
 * Hover animations
 */
function initHoverAnimations() {
    // Используем CSS для простых ховеров, тут оставляем только сложные если нужны
}

/**
 * Page load animations
 */
function initPageLoadAnimations() {
    // Плавное появление элементов шапки теперь описано в CSS
    // (headerItemIn в css/header.css), чтобы эффект загрузки был
    // одинаковым на всех страницах, а не только на главной.
}

function initSmoothScrollToTop() {
    const upButton = document.querySelector('#upBtn');
    if (upButton) {
        upButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

initSmoothScrollToTop();
