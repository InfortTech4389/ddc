// DIDC Website JavaScript

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for anchor links
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

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data.name || !data.email || !data.message) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }
        
        // Check honeypot
        if (data.website) {
            // Likely spam, fail silently
            showToast('Thank you for your message. We will get back to you soon.', 'success');
            this.reset();
            return;
        }
        
        // Submit form (in a real implementation, this would go to your backend)
        submitContactForm(data);
    });
}

// Contact form submission
async function submitContactForm(data) {
    try {
        // Show loading state
        const submitBtn = document.querySelector('#contactForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual endpoint)
        const response = await fetch('/contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showToast('Thank you for your message. We will get back to you soon.', 'success');
            document.getElementById('contactForm').reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showToast('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#contactForm button[type="submit"]');
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
    `;
    
    // Add close functionality
    toast.querySelector('.btn-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Add to page
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.card, .stat-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
    });
}

// Add fade in animation CSS
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(animationStyle);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        animateOnScroll();
    } else {
        // Show all elements immediately for users who prefer reduced motion
        const elements = document.querySelectorAll('.card, .stat-item');
        elements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
});

// Keyboard navigation enhancement
document.addEventListener('keydown', function(e) {
    // Focus management for dropdown menus
    if (e.key === 'Escape') {
        const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
        openDropdowns.forEach(dropdown => {
            const toggle = dropdown.previousElementSibling;
            if (toggle) {
                toggle.click();
                toggle.focus();
            }
        });
    }
});

// Performance monitoring (basic implementation)
window.addEventListener('load', function() {
    // Only run performance monitoring in production
    if (window.location.hostname !== 'localhost') {
        // Measure Core Web Vitals
        console.log('Performance monitoring initialized');
    }
});