// Main script for Estate Company Website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup language toggle
    setupLanguageSelector();

    // Initialize language based on stored preference or default to English
    changeLang(getCurrentLang());
    
    // Setup mobile menu
    setupMobileMenu();

    // Apply header scrolled state for pages restored mid-scroll
    scrollFunction();

    // Load gallery items for about page
    loadGalleryItems();
    
    // Load news items for about page
    loadNewsItems();

    // Check if we need to scroll to a section (for cross-page anchor links)
    const scrollTarget = sessionStorage.getItem('scrollToSection');
    if (scrollTarget) {
        sessionStorage.removeItem('scrollToSection');
        // Wait a bit for everything to render
        setTimeout(() => {
            const target = document.getElementById(scrollTarget);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }, 500);
    }
});

// Setup language toggle functionality
const LANGUAGES = ['eng', 'esp'];
const LANG_LABELS = { eng: 'EN', esp: 'ES' };
const LANG_HTML_CODES = { eng: 'en', esp: 'es' };

// Normalize legacy/stored values ('en', 'EN', 'es'...) to supported codes
function normalizeLang(lang) {
    if (!lang) return LANGUAGES[0];
    const value = String(lang).toLowerCase();
    if (LANGUAGES.includes(value)) return value;
    if (value.startsWith('es')) return 'esp';
    if (value.startsWith('en')) return 'eng';
    return LANGUAGES[0];
}

function getCurrentLang() {
    return normalizeLang(localStorage.getItem('language'));
}

function getNextLang(lang) {
    const index = LANGUAGES.indexOf(normalizeLang(lang));
    return LANGUAGES[(index + 1) % LANGUAGES.length];
}

// Update the button so it always shows the currently active language
function updateLangToggleLabel(lang) {
    const current = normalizeLang(lang);
    const next = getNextLang(current);

    document.querySelectorAll('.current-lang').forEach(el => {
        el.textContent = LANG_LABELS[current];
    });

    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
        btn.setAttribute('data-lang', current);
        btn.setAttribute('aria-label', `Switch language to ${LANG_LABELS[next]}`);
        btn.setAttribute('title', `Switch language to ${LANG_LABELS[next]}`);
    });
}

function setupLanguageSelector() {
    const toggles = document.querySelectorAll('[data-lang-toggle]');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const nextLang = getNextLang(getCurrentLang());
            changeLang(nextLang);
            closeMobileMenu();
        });
    });

    // Set initial button state
    updateLangToggleLabel(getCurrentLang());
}

// Helper function to close mobile menu
function closeMobileMenu() {
    const menuList = document.querySelector('.menu__list');
    const menuContainer = document.querySelector('.menu');
    const menuCloseBackdrop = document.querySelector('.menu--close');
    
    if (menuList && menuList.classList.contains('active')) {
        menuList.classList.remove('active');
        if (menuContainer) menuContainer.classList.remove('active');
        if (menuCloseBackdrop) menuCloseBackdrop.classList.remove('active');
        
        // Restore scroll
        setTimeout(() => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 400);
    }
}

// Setup mobile menu functionality
function setupMobileMenu() {
    const menuBtn = document.querySelector('.menu__btn');
    const menuContainer = document.querySelector('.menu');
    const menuList = document.querySelector('.menu__list');
    const menuCloseBtn = document.querySelector('.menu__close-btn');
    const menuCloseBackdrop = document.querySelector('.menu--close');
    const menuLinks = document.querySelectorAll('.menu__link');
    
    if (menuBtn && menuList) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Prevent scroll
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            
            menuList.classList.add('active');
            if (menuContainer) menuContainer.classList.add('active');
            if (menuCloseBackdrop) menuCloseBackdrop.classList.add('active');
        });
    }
    
    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    if (menuCloseBackdrop) {
        menuCloseBackdrop.addEventListener('click', function() {
            closeMobileMenu();
        });
    }

    // Close menu when clicking on any menu link
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
}

// Change language functionality
function changeLang(rawLang) {
    const lang = normalizeLang(rawLang);

    // Store language preference and keep the toggle button label in sync
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', LANG_HTML_CODES[lang]);
    updateLangToggleLabel(lang);

    if (!window.translations) {
        console.error('Translations not loaded');
        return;
    }
    
    // Update all translatable elements
    const elements = document.querySelectorAll('[data-key]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-key');
        
        // Check if we have this translation
        if (window.translations[key] && window.translations[key][lang]) {
            const translation = window.translations[key][lang];
            
            // Handle different element types
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.getAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                } else {
                    element.value = translation;
                }
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Dispatch event for other scripts that might need to know about language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // If it's just "#"
            if (href === '#') return;

            // Check if it's a link to another page with a hash
            const urlParts = href.split('#');
            const targetPath = urlParts[0];
            const targetId = urlParts[1];
            
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            const cleanTargetPath = targetPath.split('/').pop();

            // If we are navigating to a section on the SAME page
            if (!cleanTargetPath || cleanTargetPath === currentPath || (currentPath === 'index.html' && cleanTargetPath === '')) {
                const target = document.getElementById(targetId);
                if (target) {
                    e.preventDefault();
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    closeMobileMenu();
                }
            } else if (targetId) {
                // Navigating to another page with a section ID
                sessionStorage.setItem('scrollToSection', targetId);
            }
        });
    });
});

// Accordion functionality
function toggleAccordion() {
    const accordion = document.getElementById("accordion");
    if (accordion) accordion.classList.toggle("open");
}

//кнопка Наверх
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    // Header "scrolled" state - same behaviour on every page
    const header = document.querySelector('.header');
    if (header) {
        const scrolled = window.pageYOffset > 50;
        header.classList.toggle('scrolled', scrolled);
    }

    const upBtn = document.getElementById("upBtn");
    if (!upBtn) return;

    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        upBtn.style.display = "block";
    } else {
        upBtn.style.display = "none";
    }
};

// Обработка модальных окон
typeof jQuery !== "undefined" && jQuery(document).ready(function() {
    // Открытие модального окна
    $('.listing__item').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const modalId = $(this).data('modal-trigger');
        const $modal = $(`#${modalId}`);
        if ($modal.length) {
            $modal.addClass('active');
            $('body').addClass('modal-open');
        }
    });

    // Закрытие модального окна
    $('.modal__close').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).closest('.modal').removeClass('active');
        $('body').removeClass('modal-open');
    });

    $('.modal').on('click', function(e) {
        if ($(e.target).hasClass('modal')) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('active');
            $('body').removeClass('modal-open');
        }
    });

    // Закрытие по Escape
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.modal.active').removeClass('active');
            $('body').removeClass('modal-open');
        }
    });
});

// Инициализация галереи проекта
typeof jQuery !== "undefined" && jQuery(document).ready(function() {
    $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        mainClass: 'mfp-with-zoom',
        removalDelay: 300,
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [1, 1]
        },
        image: {
            verticalFit: true,
            titleSrc: function(item) {
                return item.el.attr('title') || item.el.find('img').attr('alt');
            }
        },
        callbacks: {
            open: function() {
                $('.mfp-wrap').off('click.mfpWrap').on('click.mfpWrap', function(e) {
                    if (e.target === this) {
                        $.magnificPopup.close();
                    }
                });
            }
        },
        closeOnBgClick: true,
        fixedContentPos: true
    });

    $('.project__name-img').on('click', function(e) {
        if ($(this).closest('.listing__item').length) return;
        e.preventDefault();
        $.magnificPopup.open({
            items: {
                src: $(this).attr('src')
            },
            type: 'image',
            closeOnBgClick: true,
            fixedContentPos: true
        });
    });
});

// Функция для загрузки элементов галереи
function loadGalleryItems() {
    const galleryItems = document.querySelector('.gallery__items');
    const isAboutPage = window.location.pathname.includes('about.html');
    
    if (galleryItems && isAboutPage) {
        fetch('./gallery.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const items = Array.from(doc.querySelectorAll('.gallery__items .gallery__item'));
                
                galleryItems.innerHTML = '';
                const itemsToShow = items.slice(0, 3);
                
                itemsToShow.forEach(item => {
                    const newItem = item.cloneNode(true);
                    galleryItems.appendChild(newItem);
                });
            })
            .catch(error => console.error('Ошибка загрузки галереи:', error));
    }
}

// Функция для загрузки элементов новостей
function loadNewsItems() {
    const newsItems = document.querySelector('.news__items');
    const isAboutPage = window.location.pathname.includes('about.html');
    
    if (newsItems && isAboutPage) {
        fetch('./news.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const items = Array.from(doc.querySelectorAll('.news__items .news__item'));
                
                newsItems.innerHTML = '';
                const itemsToShow = items.slice(0, 3);
                
                itemsToShow.forEach(item => {
                    const newItem = item.cloneNode(true);
                    newsItems.appendChild(newItem);
                });
            })
            .catch(error => console.error('Ошибка загрузки новостей:', error));
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};
