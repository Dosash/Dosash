// Dosash — скрипты сайта.
// Один файл на все страницы: каждый модуль проверяет наличие своих элементов.
// Стили только через классы из style.css — никаких inline-стилей.

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------
       Тосты (используются пасхалкой и запасным сценарием попапа чата)
       ------------------------------------------------------------------ */
    var toastRegion = document.querySelector('.toast-region');

    function showToast(message, duration) {
        if (!toastRegion) { return; }
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastRegion.appendChild(toast);
        requestAnimationFrame(function () {
            toast.classList.add('toast--visible');
        });
        setTimeout(function () {
            toast.classList.remove('toast--visible');
            setTimeout(function () { toast.remove(); }, 350);
        }, duration || 4000);
    }

    /* ------------------------------------------------------------------
       Тема: localStorage → prefers-color-scheme (пре-пейнт скрипт в <head>
       уже выставил атрибут, здесь только переключение и синхронизация)
       ------------------------------------------------------------------ */
    var themeToggle = document.getElementById('theme-toggle');

    function currentTheme() {
        return document.documentElement.getAttribute('data-color-scheme') === 'light' ? 'light' : 'dark';
    }

    function syncThemeToggle() {
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(currentTheme() === 'light'));
        }
    }

    if (themeToggle) {
        syncThemeToggle();
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-color-scheme', next);
            try { localStorage.setItem('preferred-theme', next); } catch (e) {}
            syncThemeToggle();
        });
    }

    /* ------------------------------------------------------------------
       Переключение платформ Twitch ⇄ Kick
       ------------------------------------------------------------------ */
    var platformButtons = document.querySelectorAll('.platform-btn');
    var currentPlatform = 'twitch';

    var platformUrls = {
        twitch: 'https://www.twitch.tv/popout/dosash/chat?popout=',
        kick: 'https://www.kick.com/dosash1/chatroom'
    };

    function setPlatform(platform) {
        currentPlatform = platform;
        platformButtons.forEach(function (btn) {
            var active = btn.dataset.platform === platform;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        ['twitch', 'kick'].forEach(function (name) {
            var player = document.getElementById(name + '-player');
            var chat = document.getElementById(name + '-chat');
            if (player) { player.classList.toggle('active', name === platform); }
            if (chat) { chat.classList.toggle('active', name === platform); }
        });
    }

    if (platformButtons.length) {
        var savedPlatform = null;
        try { savedPlatform = localStorage.getItem('preferred-platform'); } catch (e) {}
        if (savedPlatform === 'twitch' || savedPlatform === 'kick') {
            setPlatform(savedPlatform);
        }
        platformButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var platform = btn.dataset.platform;
                if (platform && platform !== currentPlatform) {
                    setPlatform(platform);
                    try { localStorage.setItem('preferred-platform', platform); } catch (e) {}
                }
            });
        });
    }

    /* ------------------------------------------------------------------
       Чат в отдельном окне
       ------------------------------------------------------------------ */
    var openChatBtn = document.getElementById('open-chat');
    if (openChatBtn) {
        openChatBtn.addEventListener('click', function () {
            // 'noopener' в features заставил бы window.open вернуть null всегда —
            // обнуляем opener вручную, чтобы null-проверка ловила реальную блокировку
            var win = window.open(platformUrls[currentPlatform], '_blank', 'width=400,height=600');
            if (win) {
                win.opener = null;
            } else {
                showToast('Браузер заблокировал всплывающее окно — разреши попапы для этого сайта.');
            }
        });
    }

    /* ------------------------------------------------------------------
       Мобильное меню
       ------------------------------------------------------------------ */
    var header = document.querySelector('.header');
    var menuToggle = document.getElementById('mobile-menu-toggle');
    var navMenu = document.getElementById('nav-menu');

    function closeMenu() {
        if (!header) { return; }
        header.classList.remove('header--menu-open');
        if (menuToggle) { menuToggle.setAttribute('aria-expanded', 'false'); }
    }

    if (header && menuToggle && navMenu) {
        menuToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            var open = header.classList.toggle('header--menu-open');
            menuToggle.setAttribute('aria-expanded', String(open));
        });
        navMenu.addEventListener('click', function (event) {
            if (event.target.closest('a')) { closeMenu(); }
        });
        document.addEventListener('click', function (event) {
            if (header.classList.contains('header--menu-open') && !header.contains(event.target)) {
                closeMenu();
            }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && header.classList.contains('header--menu-open')) {
                closeMenu();
                menuToggle.focus();
            }
        });
    }

    /* ------------------------------------------------------------------
       Шапка при скролле: тень + автоскрытие при прокрутке вниз
       ------------------------------------------------------------------ */
    if (header) {
        var lastScrollY = window.scrollY;
        var ticking = false;

        function onScroll() {
            var y = window.scrollY;
            header.classList.toggle('header--scrolled', y > 20);
            if (y > lastScrollY && y > 200 && !header.classList.contains('header--menu-open')) {
                header.classList.add('header--hidden');
            } else {
                header.classList.remove('header--hidden');
            }
            lastScrollY = y;
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onScroll);
            }
        }, { passive: true });
        onScroll();
    }

    /* ------------------------------------------------------------------
       Появление при скролле (.reveal → .is-visible)
       ------------------------------------------------------------------ */
    var revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length) {
        if (reducedMotion || !('IntersectionObserver' in window)) {
            revealElements.forEach(function (el) { el.classList.add('is-visible'); });
        } else {
            var revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
            revealElements.forEach(function (el) { revealObserver.observe(el); });
        }
    }

    /* ------------------------------------------------------------------
       Подсветка активного пункта навигации (только на главной)
       ------------------------------------------------------------------ */
    var sections = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('.nav-menu .nav-link[href^="#"]');
    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    navLinks.forEach(function (link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(function (section) { sectionObserver.observe(section); });
    }

    /* ------------------------------------------------------------------
       Пасхалка: Konami Code
       ------------------------------------------------------------------ */
    var konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    var konamiIndex = 0;

    document.addEventListener('keydown', function (event) {
        if (event.code === konamiSequence[konamiIndex]) {
            konamiIndex += 1;
            if (konamiIndex === konamiSequence.length) {
                konamiIndex = 0;
                showToast('🎮 Konami Code активирован! Добро пожаловать в секретную зону геймера! 🎮', 6000);
                if (!reducedMotion) {
                    document.body.classList.add('party');
                    setTimeout(function () {
                        document.body.classList.remove('party');
                    }, 6000);
                }
            }
        } else {
            konamiIndex = event.code === konamiSequence[0] ? 1 : 0;
        }
    });

    console.log('%cDosash%c ⚡ Стример • Геймер • Технологии', 'font-weight:bold;font-size:16px;background:linear-gradient(120deg,#a855f7,#ec4899,#22d3ee);-webkit-background-clip:text;color:transparent;', 'color:#a855f7;');
    console.log('Подсказка: попробуй Konami Code — ↑ ↑ ↓ ↓ ← → ← → B A');
});
