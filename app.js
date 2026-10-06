// Dosash — скрипты сайта.
// Один файл на все страницы: каждый модуль проверяет наличие своих элементов.
// Стили только через классы из style.css — никаких inline-стилей
// (исключение — CSS-переменная угла колеса рулетки).

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var root = document.documentElement;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------
       Тосты (пасхалка)
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
       Тема: сохранённый выбор → системная настройка
       (пре-пейнт скрипт в <head> уже выставил сохранённый атрибут)
       ------------------------------------------------------------------ */
    var themeToggle = document.getElementById('theme-toggle');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
        var attr = root.getAttribute('data-color-scheme');
        if (attr === 'light' || attr === 'dark') { return attr; }
        return systemDark.matches ? 'dark' : 'light';
    }

    function syncThemeToggle() {
        if (!themeToggle) { return; }
        var dark = currentTheme() === 'dark';
        themeToggle.setAttribute('aria-pressed', String(dark));
        themeToggle.setAttribute('aria-label', dark ? 'Светлая тема' : 'Тёмная тема');
    }

    if (themeToggle) {
        syncThemeToggle();
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-color-scheme', next);
            try { localStorage.setItem('preferred-theme', next); } catch (e) {}
            syncThemeToggle();
        });
        if (systemDark.addEventListener) {
            systemDark.addEventListener('change', syncThemeToggle);
        }
    }

    /* ------------------------------------------------------------------
       Мобильное меню
       ------------------------------------------------------------------ */
    var header = document.querySelector('.header');
    var menuToggle = document.getElementById('menu-toggle');
    var navMenu = document.getElementById('nav-menu');

    function closeMenu() {
        if (!header) { return; }
        header.classList.remove('header--menu-open');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Открыть меню');
        }
    }

    if (header && menuToggle && navMenu) {
        menuToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            var open = header.classList.toggle('header--menu-open');
            menuToggle.setAttribute('aria-expanded', String(open));
            menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
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
       Шапка при скролле: линия снизу + автоскрытие при прокрутке вниз
       ------------------------------------------------------------------ */
    if (header) {
        var lastScrollY = window.scrollY;
        var ticking = false;

        function onScroll() {
            var y = window.scrollY;
            header.classList.toggle('header--scrolled', y > 8);
            var focusInside = header.contains(document.activeElement);
            if (y > lastScrollY && y > 240 && !header.classList.contains('header--menu-open') && !focusInside) {
                header.classList.add('header--hidden');
            } else if (y < lastScrollY || y <= 240) {
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
        header.addEventListener('focusin', function () {
            header.classList.remove('header--hidden');
        });
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
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
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
                        var active = link.getAttribute('href') === '#' + id;
                        link.classList.toggle('active', active);
                        if (active) { link.setAttribute('aria-current', 'true'); }
                        else { link.removeAttribute('aria-current'); }
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(function (section) { sectionObserver.observe(section); });
    }

    /* ------------------------------------------------------------------
       Мини-рулетка: тот же честный жребий, что и в dish-roulette —
       crypto.getRandomValues с отбраковкой, победитель выбирается до анимации
       ------------------------------------------------------------------ */
    var wheel = document.getElementById('wheel');
    var spinBtn = document.getElementById('wheel-spin');
    var wheelResult = document.getElementById('wheel-result');

    function fairIndex(n) {
        if (window.crypto && window.crypto.getRandomValues) {
            var limit = Math.floor(0x100000000 / n) * n;
            var buf = new Uint32Array(1);
            do { window.crypto.getRandomValues(buf); } while (buf[0] >= limit);
            return buf[0] % n;
        }
        return Math.floor(Math.random() * n);
    }

    if (wheel && spinBtn && wheelResult) {
        var names = Array.prototype.map.call(wheel.children, function (el) { return el.textContent; });
        var sector = 360 / names.length;
        var turn = 0;

        spinBtn.addEventListener('click', function () {
            var winner = fairIndex(names.length);
            // Сектор i занимает [i·sector, (i+1)·sector) от верха по часовой;
            // указатель сверху, поэтому центр сектора доворачиваем до 0°
            var jitter = (fairIndex(1000) / 1000 - 0.5) * sector * 0.6;
            var target = 360 - (winner * sector + sector / 2) + jitter;
            var base = turn - (turn % 360);
            turn = base + 360 * 4 + target;

            spinBtn.disabled = true;
            wheelResult.textContent = 'Крутится…';
            wheel.style.setProperty('--turn', turn + 'deg');

            setTimeout(function () {
                wheelResult.innerHTML = '';
                wheelResult.appendChild(document.createTextNode('Моет: '));
                var strong = document.createElement('strong');
                strong.textContent = names[winner];
                wheelResult.appendChild(strong);
                spinBtn.disabled = false;
                spinBtn.textContent = 'Ещё раз';
            }, reducedMotion ? 50 : 3300);
        });
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
                showToast('🎮 Konami Code! Секретный уровень открыт — и он тоже под MIT.', 6000);
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

    console.log('%cDosash%c — программы, которые можно просто взять', 'font-weight:bold;font-size:16px;color:#3d6a56;', 'color:#52645b;');
    console.log('Подсказка: попробуй Konami Code — ↑ ↑ ↓ ↓ ← → ← → B A');
});
