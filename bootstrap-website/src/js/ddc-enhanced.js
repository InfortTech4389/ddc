// DDC Enhanced JavaScript Functionality
// Author: DDC Development Team
// Description: Enhanced interactions and animations for DDC website

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== Navigation Enhancement ==========
    const navbar = document.getElementById('mainNavbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Enhanced scroll behavior with glassmorphism effect
    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
    
    window.addEventListener('scroll', updateNavbar);
    updateNavbar(); // Initial call
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Update active nav item
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
    
    // ========== Active Section Detection ==========
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNavigation() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavigation);
    
    // ========== Animation on Scroll ==========
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special handling for statistics animation
                if (entry.target.classList.contains('stat-number')) {
                    animateStatNumber(entry.target);
                }
                
                // Special handling for service cards
                if (entry.target.classList.contains('service-card')) {
                    setTimeout(() => {
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.opacity = '1';
                    }, 200);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.fade-in-up, .slide-in-right, .service-card, .stat-number, .portfolio-card'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // ========== Statistics Counter Animation ==========
    function animateStatNumber(element) {
        const target = parseInt(element.getAttribute('data-target')) || 
                      parseInt(element.textContent.replace(/[^\d]/g, ''));
        
        if (!target) return;
        
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format based on original content
            if (element.textContent.includes('%')) {
                element.textContent = Math.floor(current) + '%';
            } else if (element.textContent.includes('+')) {
                element.textContent = Math.floor(current) + '+';
            } else if (element.textContent.includes('/')) {
                element.textContent = '24/7';
            } else {
                element.textContent = Math.floor(current);
            }
        }, 20);
    }
    
    // ========== Current Time Display ==========
    function updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const options = { 
                timeZone: 'UTC', 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short'
            };
            timeElement.textContent = `${now.toLocaleTimeString('en-US', options)} UTC`;
        }
    }
    
    // Update time every minute
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
    
    // ========== Enhanced Form Handling ==========
    const consultationForm = document.querySelector('#consultationModal form');
    
    if (consultationForm) {
        consultationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                // Show success message
                showNotification('Success! We\'ll contact you within 24 hours.', 'success');
                
                // Reset form
                this.reset();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('consultationModal'));
                modal.hide();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
        
        // Real-time form validation
        const requiredFields = consultationForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        
        field.classList.remove('is-valid', 'is-invalid');
        
        if (!value) {
            field.classList.add('is-invalid');
            return false;
        }
        
        if (fieldType === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }
        
        field.classList.add('is-valid');
        return true;
    }
    
    // ========== Notification System ==========
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification-toast').forEach(toast => {
            toast.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification-toast alert alert-${type} alert-dismissible`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // ========== Enhanced Button Interactions ==========
    const primaryButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    primaryButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
        
        button.addEventListener('click', function(e) {
            // Ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // ========== Service Card Hover Effects ==========
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            
            // Animate icon
            const icon = this.querySelector('.service-icon i');
            if (icon) {
                icon.style.transform = 'rotateY(180deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            
            // Reset icon
            const icon = this.querySelector('.service-icon i');
            if (icon) {
                icon.style.transform = 'rotateY(0deg)';
            }
        });
    });
    
    // ========== Parallax Scroll Effects ==========
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-animation');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const translateY = scrolled * speed;
            element.style.transform = `translateY(${translateY}px)`;
        });
    }
    
    window.addEventListener('scroll', updateParallax);
    
    // ========== Intersection Observer for Performance ==========
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // ========== Dynamic Content Loading ==========
    function loadDynamicContent() {
        // Load testimonials dynamically
        const testimonials = [
            {
                name: "Sarah Johnson",
                title: "CTO, Global Finance Corp",
                text: "DDC transformed our entire technology infrastructure. Their AI solutions reduced our processing time by 75%.",
                rating: 5
            },
            {
                name: "Michael Chen",
                title: "VP Engineering, Healthcare Plus",
                text: "Outstanding technical expertise and global support. They delivered our complex medical AI platform ahead of schedule.",
                rating: 5
            },
            {
                name: "Emma Rodriguez",
                title: "Director of IT, Retail Giant",
                text: "Their cloud migration strategy saved us $2M annually while improving our global performance by 40%.",
                rating: 5
            }
        ];
        
        // You can add more dynamic content loading here
    }
    
    // ========== Error Handling ==========
    window.addEventListener('error', function(e) {
        console.error('JavaScript Error:', e.error);
        // You can implement error tracking here
    });
    
    // ========== Performance Monitoring ==========
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        });
    }
    
    // Initialize dynamic content
    loadDynamicContent();
    
    console.log('DDC Enhanced JavaScript initialized successfully!');
});

// ========== CSS Animations (Injected via JavaScript) ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .navbar-scrolled {
        background: rgba(26, 40, 71, 0.95) !important;
        backdrop-filter: blur(20px);
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    
    .service-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .service-icon i {
        transition: transform 0.3s ease;
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`;

document.head.appendChild(style);
