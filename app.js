document.addEventListener('DOMContentLoaded', function() {
    // Platform switching state
    let currentPlatform = 'twitch'; // Default platform

    // Platform URLs for chat opening
    const platformUrls = {
        twitch: {
            chat: 'https://www.twitch.tv/popout/dosash/chat?popout=',
            channel: 'https://twitch.tv/dosash'
        },
        kick: {
            chat: 'https://www.kick.com/dosash1/chatroom',
            channel: 'https://kick.com/dosash1'
        }
    };

    // Initialize platform switching functionality
    initializePlatformSwitching();

    // Platform switching functions
    function initializePlatformSwitching() {
        const twitchBtn = document.getElementById('twitch-btn');
        const kickBtn = document.getElementById('kick-btn');
        const twitchPlayer = document.getElementById('twitch-player');
        const kickPlayer = document.getElementById('kick-player');
        const twitchChat = document.getElementById('twitch-chat');
        const kickChat = document.getElementById('kick-chat');

        if (!twitchBtn || !kickBtn || !twitchPlayer || !kickPlayer || !twitchChat || !kickChat) {
            return;
        }

        // Load saved platform preference
        const savedPlatform = localStorage.getItem('preferred-platform') || 'twitch';
        currentPlatform = savedPlatform;

        // Set initial platform
        if (currentPlatform === 'kick') {
            switchToKick(false); // false = no animation on initial load
        } else {
            switchToTwitch(false);
        }

        // Add event listeners
        if (twitchBtn) {
            twitchBtn.addEventListener('click', () => switchToTwitch(true));
        }
        
        if (kickBtn) {
            kickBtn.addEventListener('click', () => switchToKick(true));
        }

        console.log(`🎮 Platform switching initialized. Current platform: ${currentPlatform}`);
    }

    function switchToTwitch(withAnimation = true) {
        if (currentPlatform === 'twitch') return;
        
        currentPlatform = 'twitch';
        localStorage.setItem('preferred-platform', 'twitch');
        
        // Update button states
        updateActiveButton('twitch');
        
        // Switch players and chats
        switchPlatformContent('twitch', withAnimation);
        
        if (withAnimation) {
            showNotification('🎮 Переключено на Twitch!', 'success');
        }
        
        console.log('✅ Switched to Twitch platform');
    }

    function switchToKick(withAnimation = true) {
        if (currentPlatform === 'kick') return;
        
        currentPlatform = 'kick';
        localStorage.setItem('preferred-platform', 'kick');
        
        // Update button states
        updateActiveButton('kick');
        
        // Switch players and chats
        switchPlatformContent('kick', withAnimation);
        
        if (withAnimation) {
            showNotification('⚡ Переключено на Kick!', 'success');
        }
        
        console.log('✅ Switched to Kick platform');
    }

    function updateActiveButton(platform) {
        const twitchBtn = document.getElementById('twitch-btn');
        const kickBtn = document.getElementById('kick-btn');
        
        if (twitchBtn && kickBtn) {
            // Remove active class from both buttons
            twitchBtn.classList.remove('active');
            kickBtn.classList.remove('active');
            
            // Add active class to selected platform
            if (platform === 'twitch') {
                twitchBtn.classList.add('active');
            } else {
                kickBtn.classList.add('active');
            }
        }
    }

    function switchPlatformContent(platform, withAnimation = true) {
        // Get all player and chat elements
        const twitchPlayer = document.getElementById('twitch-player');
        const kickPlayer = document.getElementById('kick-player');
        const twitchChat = document.getElementById('twitch-chat');
        const kickChat = document.getElementById('kick-chat');

        if (!twitchPlayer || !kickPlayer || !twitchChat || !kickChat) {
            console.error('❌ Platform switching elements not found');
            return;
        }

        if (withAnimation) {
            // Animate out current platform
            const currentPlayerElements = document.querySelectorAll('.player-frame.active, .chat-frame.active');
            currentPlayerElements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateX(-100%)';
            });

            // Wait for animation to complete, then switch
            setTimeout(() => {
                // Remove active class from all elements
                document.querySelectorAll('.player-frame, .chat-frame').forEach(element => {
                    element.classList.remove('active');
                });

                // Add active class to new platform elements
                if (platform === 'twitch') {
                    twitchPlayer.classList.add('active');
                    twitchChat.classList.add('active');
                } else {
                    kickPlayer.classList.add('active');
                    kickChat.classList.add('active');
                }

                // Reset and animate in new platform
                setTimeout(() => {
                    const newActiveElements = document.querySelectorAll('.player-frame.active, .chat-frame.active');
                    newActiveElements.forEach(element => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateX(0)';
                    });
                }, 50);
            }, 300);
        } else {
            // Instant switch without animation
            document.querySelectorAll('.player-frame, .chat-frame').forEach(element => {
                element.classList.remove('active');
            });

            if (platform === 'twitch') {
                twitchPlayer.classList.add('active');
                twitchChat.classList.add('active');
            } else {
                kickPlayer.classList.add('active');
                kickChat.classList.add('active');
            }
        }
    }

    function openChatInNewWindow() {
        const platformData = platformUrls[currentPlatform];
        if (!platformData) {
            showNotification('❌ Ошибка: неизвестная платформа', 'error');
            return;
        }

        const chatUrl = platformData.chat;
        const platformName = currentPlatform === 'twitch' ? 'Twitch' : 'Kick';
        
        const chatWindow = window.open(
            chatUrl, 
            `${platformName}Chat`, 
            'width=400,height=600,scrollbars=yes,resizable=yes'
        );
        
        if (chatWindow) {
            showNotification(`💬 Чат ${platformName} открыт в новом окне!`, 'success');
        } else {
            showNotification('❌ Не удалось открыть чат. Проверьте настройки блокировки всплывающих окон.', 'error');
        }
    }

    // Theme switching functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (themeToggle && themeIcon) {
        // Set initial theme
        updateTheme();

        themeToggle.addEventListener('click', function() {
            isDarkMode = !isDarkMode;
            updateTheme();
            showNotification(`${isDarkMode ? '🌙' : '☀️'} Тема изменена на ${isDarkMode ? 'тёмную' : 'светлую'}`, 'success');
        });
    }

function updateTheme() {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
            themeIcon.textContent = '☀️';
        } else {
            document.documentElement.setAttribute('data-color-scheme', 'light');
            themeIcon.textContent = '🌙';
        }
    }
    
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    let isMobileMenuOpen = false;
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            isMobileMenuOpen = !isMobileMenuOpen;
            toggleMobileMenu();
        });
    }
    
    function toggleMobileMenu() {
        if (!navMenu || !mobileMenuToggle) {
            return;
        }
        if (isMobileMenuOpen) {
            navMenu.style.display = 'flex';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.flexDirection = 'column';
            navMenu.style.background = 'var(--color-surface)';
            navMenu.style.border = '1px solid var(--color-border)';
            navMenu.style.borderRadius = 'var(--radius-lg)';
            navMenu.style.padding = 'var(--space-16)';
            navMenu.style.margin = 'var(--space-8)';
            navMenu.style.boxShadow = 'var(--shadow-lg)';
            navMenu.style.zIndex = '1000';
            mobileMenuToggle.classList.add('active');
        } else {
            navMenu.style.display = '';
            navMenu.style.position = '';
            navMenu.style.top = '';
            navMenu.style.left = '';
            navMenu.style.right = '';
            navMenu.style.flexDirection = '';
            navMenu.style.background = '';
            navMenu.style.border = '';
            navMenu.style.borderRadius = '';
            navMenu.style.padding = '';
            navMenu.style.margin = '';
            navMenu.style.boxShadow = '';
            navMenu.style.zIndex = '';
            mobileMenuToggle.classList.remove('active');
        }
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && navMenu && mobileMenuToggle) {
                isMobileMenuOpen = false;
                toggleMobileMenu();
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (isMobileMenuOpen && navMenu && mobileMenuToggle && !event.target.closest('.nav')) {
            isMobileMenuOpen = false;
            toggleMobileMenu();
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                showNotification(`📍 Переход к разделу "${targetId}"`, 'info');
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.style.background = 'rgba(var(--color-surface), 0.95)';
                header.style.backdropFilter = 'blur(20px)';
                header.style.boxShadow = 'var(--shadow-sm)';
            } else {
                header.style.background = 'rgba(var(--color-background), 0.95)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.boxShadow = 'none';
            }
            
            // Hide/show header on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    // Open chat in new window functionality
    const openChatButton = document.getElementById('open-chat');
    if (openChatButton) {
        openChatButton.addEventListener('click', openChatInNewWindow);
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll(
        '.info-card, .social-link, .support-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Active navigation link highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNavLink() {
        if (!header) {
            return;
        }
        const scrollY = window.scrollY;
        const headerHeight = document.querySelector('.header').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    if (header) {
        window.addEventListener('scroll', updateActiveNavLink);
    }
    
    // Add active class styles
    const style = document.createElement('style');
    style.textContent = `
        .nav-link.active {
            color: var(--color-primary) !important;
        }
        .nav-link.active::after {
            width: 100% !important;
        }
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    `;
    document.head.appendChild(style);
    
    // Interactive skill tags
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Status indicator animation
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        setInterval(() => {
            statusDot.style.transform = 'scale(1.2)';
            setTimeout(() => {
                statusDot.style.transform = 'scale(1)';
            }, 200);
        }, 2000);
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMobileMenuOpen && navMenu && mobileMenuToggle) {
            isMobileMenuOpen = false;
            toggleMobileMenu();
        }
    });
    
    // Initialize tooltips for social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = 'Открыть в новой вкладке';
            Object.assign(tooltip.style, {
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%) translateY(-8px)',
                background: 'var(--color-text)',
                color: 'var(--color-background)',
                padding: 'var(--space-4) var(--space-8)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                whiteSpace: 'nowrap',
                zIndex: '1000',
                opacity: '0',
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none'
            });
            
            this.style.position = 'relative';
            this.appendChild(tooltip);
            
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 100);
        });
        
        link.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip.parentElement) {
                        tooltip.remove();
                    }
                }, 200);
            }
        });
    });
    
    // Add click effect for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            Object.assign(ripple.style, {
                position: 'absolute',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'scale(0)',
                animation: 'ripple 0.6s linear',
                pointerEvents: 'none'
            });
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentElement) {
                    ripple.remove();
                }
            }, 600);
        });
    });
    
    // Add ripple animation keyframes
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Add styles directly to element
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            zIndex: '10000',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-16)',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '400px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        const notificationContent = notification.querySelector('.notification-content');
        Object.assign(notificationContent.style, {
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-12)'
        });
        
        const icon = notification.querySelector('.notification-icon');
        icon.style.fontSize = 'var(--font-size-lg)';
        
        const closeBtn = notification.querySelector('.notification-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            fontSize: 'var(--font-size-xl)',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            marginLeft: 'auto'
        });
        
        closeBtn.addEventListener('click', function() {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        });
        
        if (type === 'success') {
            notification.style.borderColor = 'var(--color-success)';
            notification.style.background = 'rgba(var(--color-success-rgb), 0.1)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--color-error)';
            notification.style.background = 'rgba(var(--color-error-rgb), 0.1)';
        } else if (type === 'warning') {
            notification.style.borderColor = 'var(--color-warning)';
            notification.style.background = 'rgba(var(--color-warning-rgb), 0.1)';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }
    
    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }
    
    // Easter egg - Konami code
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            showNotification('🎮 Konami Code активирован! Добро пожаловать в секретную зону геймера! 🎮', 'success');
            // Add some fun visual effect
            document.body.style.animation = 'rainbow 2s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 2000);
        }
    });
    
    // Add rainbow animation for easter egg
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            25% { filter: hue-rotate(90deg); }
            50% { filter: hue-rotate(180deg); }
            75% { filter: hue-rotate(270deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);
    
    // Log instructions for using the JSON file
    console.log('🎮 Portfolio loaded successfully!');
    console.log(`⚡ Current streaming platform: ${currentPlatform}`);
    console.log('🔄 Platform switching functionality active');
    console.log('💡 Попробуйте использовать Konami Code для пасхалки!');
    console.log('🔄 После создания файла обновите страницу для загрузки игр из JSON');
});
