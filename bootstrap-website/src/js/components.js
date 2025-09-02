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
        
        // Initialize navbar scroll effects
        initializeNavbarScrollEffect();
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
