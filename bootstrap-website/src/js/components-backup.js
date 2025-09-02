/**
 * DDC Component Loader - Dynamically loads header and footer components
 * This script automatically includes header and footer HTML files in each page
 * and adjusts links based on the current page location
 */

// Determine the base path based on current location
function getBasePath() {
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1;
    
    // If we're in the root directory, return empty string
    if (depth === 0 || currentPath === '/' || currentPath.endsWith('/index.html')) {
        return '';
    }
    
    // For subdirectories, return appropriate number of ../
    return '../'.repeat(depth);
}

// Component loader function with dynamic path adjustment
async function loadComponent(elementId, componentPath) {
    try {
        const basePath = getBasePath();
        const fullPath = basePath + componentPath;
        
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${fullPath}: ${response.statusText}`);
        }
        let html = await response.text();
        
        // Adjust all links in the component to work from current location
        html = adjustLinksInHTML(html, basePath);
        
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            // Initialize any event listeners or functionality
            initializeComponentFeatures(elementId);
        }
    } catch (error) {
        console.error('Error loading component:', error);
        // Fallback for local development or if fetch fails
        loadComponentFallback(elementId, componentPath);
    }
}

// Adjust links in HTML based on current page location
function adjustLinksInHTML(html, basePath) {
    // Replace absolute paths with relative paths based on current location
    html = html.replace(/href="\//g, `href="${basePath}`);
    html = html.replace(/src="\//g, `src="${basePath}`);
    
    // Handle special cases for root links
    html = html.replace(/href=""/g, 'href="index.html"');
    html = html.replace(new RegExp(`href="${basePath}"`, 'g'), `href="${basePath}index.html"`);
    
    return html;
}

// Fallback for when fetch is not available (file:// protocol)
function loadComponentFallback(elementId, componentPath) {
    const basePath = getBasePath();
    const fullPath = basePath + componentPath;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fullPath, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) { // 0 for file:// protocol
                let html = xhr.responseText;
                html = adjustLinksInHTML(html, basePath);
                
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = html;
                    initializeComponentFeatures(elementId);
                }
            }
        }
    };
    xhr.send();
}

// Initialize component features after loading
function initializeComponentFeatures(elementId) {
    if (elementId === 'header-container') {
        // Set active navigation link based on current page
        setTimeout(() => setActiveNavigation(), 100);
        
        // Initialize dropdown hover effects (optional)
        initializeDropdownEffects();
    }
    
    if (elementId === 'footer-container') {
        // Initialize scroll to top button
        initializeScrollToTop();
        
        // Initialize newsletter form
        initializeNewsletterForm();
    }
}

// Set active navigation link based on current page
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href) {
            // Clean the href for comparison
            let linkPath = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
            
            // Check if current page matches this link
            if ((currentPath === '/' || currentPath.endsWith('/index.html')) && linkPath === 'index.html') {
                link.classList.add('active');
            } else if (currentPath.includes(linkPath) && linkPath !== 'index.html') {
                link.classList.add('active');
            }
        }
    });
}

// Initialize dropdown hover effects for better UX
function initializeDropdownEffects() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (dropdownToggle && dropdownMenu) {
            // Add hover effect for desktop
            dropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth > 992) { // Only on desktop
                    dropdownToggle.classList.add('show');
                    dropdownMenu.classList.add('show');
                }
            });
            
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 992) { // Only on desktop
                    dropdownToggle.classList.remove('show');
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    });
}

// Initialize scroll to top functionality
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        // Smooth scroll to top
        scrollToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize newsletter form
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Basic email validation
            if (isValidEmail(email)) {
                // Here you would typically send to your newsletter service
                alert('Thank you for subscribing to our newsletter!');
                this.querySelector('input[type="email"]').value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        loadComponent('header-container', 'includes/header.html');
    }
    
    // Load footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        loadComponent('footer-container', 'includes/footer.html');
    }
});

// Export functions for potential external use
window.DDCComponents = {
    loadComponent,
    setActiveNavigation,
    getBasePath
};

// Adjust links in HTML based on current page location
function adjustLinksInHTML(html, basePath) {
    // Replace absolute paths with relative paths based on current location
    html = html.replace(/href="\//g, `href="${basePath}`);
    html = html.replace(/src="\//g, `src="${basePath}`);
    
    // Handle special cases for root links
    html = html.replace(/href=""/g, 'href="index.html"');
    html = html.replace(new RegExp(`href="${basePath}"`, 'g'), `href="${basePath}index.html"`);
    
    return html;
}

// Fallback for when fetch is not available (file:// protocol)
function loadComponentFallback(elementId, componentPath) {
    const basePath = getBasePath();
    const fullPath = basePath + componentPath;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fullPath, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) { // 0 for file:// protocol
                let html = xhr.responseText;
                html = adjustLinksInHTML(html, basePath);
                
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = html;
                    initializeComponentFeatures(elementId);
                }
            }
        }
    };
    xhr.send();
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        loadComponent('header-container', 'includes/header.html');
    }
    
    // Load footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        loadComponent('footer-container', 'includes/footer.html');
    }
});
    if (footerContainer) {
        loadComponent('footer-container', 'includes/footer.html');
    }
});

// Initialize component features after loading
function initializeComponentFeatures(elementId) {
    if (elementId === 'header-container') {
        // Set active navigation link based on current page
        setActiveNavigation();
        
        // Initialize dropdown hover effects (optional)
        initializeDropdownEffects();
    }
    
    if (elementId === 'footer-container') {
        // Initialize scroll to top button
        initializeScrollToTop();
        
        // Initialize newsletter form
        initializeNewsletterForm();
    }
}

// Set active navigation link based on current page
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href) {
            // Remove base path for comparison
            const linkPath = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
            
            // Check if current page matches this link
            if (currentPath.includes(linkPath) || 
                (currentPath === '/' && linkPath === 'index.html') ||
                (currentPath.endsWith('/') && linkPath === 'index.html')) {
                link.classList.add('active');
            }
        }
    });
}

// Initialize dropdown hover effects for better UX
function initializeDropdownEffects() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (dropdownToggle && dropdownMenu) {
            // Add hover effect for desktop
            dropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth > 992) { // Only on desktop
                    dropdownToggle.classList.add('show');
                    dropdownMenu.classList.add('show');
                }
            });
            
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 992) { // Only on desktop
                    dropdownToggle.classList.remove('show');
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    });
}

// Initialize scroll to top functionality
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        // Smooth scroll to top
        scrollToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize newsletter form
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Basic email validation
            if (isValidEmail(email)) {
                // Here you would typically send to your newsletter service
                alert('Thank you for subscribing to our newsletter!');
                this.querySelector('input[type="email"]').value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
    if (footerContainer) {
        loadComponent('footer-container', '/includes/footer.html');
    }
    
    // Initialize navigation highlighting after header loads
    setTimeout(() => {
        highlightCurrentPage();
        initializeNavbarScrollEffect();
    }, 100);
});

// Highlight current page in navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath || 
           (currentPath === '/' && link.getAttribute('href') === '/') ||
           (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/')) {
            link.classList.add('active');
        }
    });
}

// Navbar scroll effect
function initializeNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// Enhanced dropdown interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects for desktop dropdowns
    if (window.innerWidth > 991) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                dropdown.addEventListener('mouseenter', function() {
                    menu.classList.add('show');
                    toggle.setAttribute('aria-expanded', 'true');
                });
                
                dropdown.addEventListener('mouseleave', function() {
                    menu.classList.remove('show');
                    toggle.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }
});

// Newsletter form handler
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send the email to your backend
            // For now, we'll just show a success message
            const button = this.querySelector('button');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-check me-2"></i>Subscribed!';
            button.classList.remove('btn-danger');
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-danger');
                this.querySelector('input[type="email"]').value = '';
            }, 3000);
        });
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Enhanced accessibility
document.addEventListener('DOMContentLoaded', function() {
    // Keyboard navigation for dropdowns
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Focus management for mobile menu
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            setTimeout(() => {
                if (navbarCollapse.classList.contains('show')) {
                    const firstLink = navbarCollapse.querySelector('.nav-link');
                    if (firstLink) firstLink.focus();
                }
            }, 100);
        });
    }
});

// Performance optimization - Lazy load components
function observeComponents() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', observeComponents);

// Export functions for potential external use
window.DDCComponents = {
    loadComponent,
    highlightCurrentPage,
    initializeNavbarScrollEffect
};
