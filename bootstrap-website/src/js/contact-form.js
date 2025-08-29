/**
 * DIDC Contact Form - Professional Form Handling
 * International-grade form validation, UX, and submission handling
 */

class ContactForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.isSubmitting = false;
        this.uploadedFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.setupFileUpload();
        this.setupFormTracking();
        this.prefillFromURL();
        this.setupAccessibility();
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Phone number formatting
        const phoneInput = this.form.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        }
        
        // Dynamic CC email display
        const purposeSelect = this.form.querySelector('#purpose');
        if (purposeSelect) {
            purposeSelect.addEventListener('change', (e) => this.updateCCInfo(e));
        }
        
        // Auto-resize textarea
        const messageTextarea = this.form.querySelector('#message');
        if (messageTextarea) {
            messageTextarea.addEventListener('input', (e) => this.autoResizeTextarea(e));
        }
        
        // Country-specific formatting
        const countrySelect = this.form.querySelector('#country');
        if (countrySelect) {
            countrySelect.addEventListener('change', (e) => this.updateCountrySpecificFields(e));
        }
    }
    
    setupRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => this.validateField(input));
            
            // Clear errors on focus
            input.addEventListener('focus', () => this.clearFieldError(input));
            
            // Real-time validation for email and phone
            if (input.type === 'email' || input.type === 'tel') {
                input.addEventListener('input', () => {
                    clearTimeout(input.validationTimeout);
                    input.validationTimeout = setTimeout(() => {
                        this.validateField(input);
                    }, 500);
                });
            }
        });
    }
    
    setupFileUpload() {
        const fileInput = this.form.querySelector('#files');
        const dropZone = this.form.querySelector('.file-drop-zone');
        
        if (!fileInput || !dropZone) return;
        
        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        // Click to upload
        dropZone.addEventListener('click', () => fileInput.click());
    }
    
    setupFormTracking() {
        // Track form start
        const firstInput = this.form.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.addEventListener('focus', () => {
                if (!this.formStarted) {
                    this.formStarted = Date.now();
                    this.trackEvent('form_start');
                }
            });
        }
        
        // Track field completion
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                if (field.value.trim()) {
                    this.trackEvent('field_completed', { field: field.name });
                }
            });
        });
        
        // Track abandonment
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.formStarted && !this.formCompleted) {
                this.trackEvent('form_abandonment');
            }
        });
    }
    
    setupAccessibility() {
        // Announce form errors to screen readers
        const errorContainer = document.createElement('div');
        errorContainer.setAttribute('aria-live', 'polite');
        errorContainer.setAttribute('aria-atomic', 'true');
        errorContainer.className = 'sr-only';
        this.form.appendChild(errorContainer);
        this.errorAnnouncer = errorContainer;
        
        // Enhanced keyboard navigation
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleSubmit(e);
                }
            });
        }
    }
    
    prefillFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = document.referrer;
        
        // Set referrer
        const referrerInput = this.form.querySelector('input[name="referrer"]');
        if (referrerInput) {
            referrerInput.value = referrer;
        }
        
        // Prefill from URL parameters
        urlParams.forEach((value, key) => {
            const input = this.form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = decodeURIComponent(value);
            }
        });
        
        // Set timestamp
        const timestampInput = this.form.querySelector('input[name="timestamp"]');
        if (timestampInput) {
            timestampInput.value = new Date().toISOString();
        }
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} is required`;
        }
        
        // Type-specific validation
        if (value && !isValid === false) {
            switch (field.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                    
                case 'tel':
                    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
                    
                case 'url':
                    try {
                        new URL(value);
                    } catch {
                        isValid = false;
                        errorMessage = 'Please enter a valid URL';
                    }
                    break;
            }
        }
        
        // Custom validation rules
        if (fieldName === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters long';
        }
        
        // Display validation result
        this.displayFieldValidation(field, isValid, errorMessage);
        return isValid;
    }
    
    displayFieldValidation(field, isValid, errorMessage) {
        const fieldGroup = field.closest('.form-group') || field.closest('.mb-3');
        if (!fieldGroup) return;
        
        // Remove existing error elements
        const existingError = fieldGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Remove error classes
        field.classList.remove('is-invalid', 'is-valid');
        fieldGroup.classList.remove('has-error', 'has-success');
        
        if (isValid && field.value.trim()) {
            // Show success state
            field.classList.add('is-valid');
            fieldGroup.classList.add('has-success');
        } else if (!isValid) {
            // Show error state
            field.classList.add('is-invalid');
            fieldGroup.classList.add('has-error');
            
            // Create error element
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message text-danger mt-1';
            errorElement.textContent = errorMessage;
            errorElement.setAttribute('role', 'alert');
            
            fieldGroup.appendChild(errorElement);
            
            // Announce error to screen readers
            if (this.errorAnnouncer) {
                this.errorAnnouncer.textContent = errorMessage;
            }
        }
    }
    
    handleFiles(files) {
        const fileList = this.form.querySelector('.file-list');
        
        Array.from(files).forEach(file => {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }
            
            // Add to uploaded files
            this.uploadedFiles.push(file);
            
            // Create file item element
            const fileItem = this.createFileItem(file);
            fileList.appendChild(fileItem);
        });
        
        this.updateFileInput();
    }
    
    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                isValid: false,
                message: `File "${file.name}" is too large. Maximum size is 10MB.`
            };
        }
        
        // Check file extension
        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.allowedExtensions.includes(extension)) {
            return {
                isValid: false,
                message: `File type ".${extension}" is not allowed. Allowed types: ${this.allowedExtensions.join(', ')}`
            };
        }
        
        return { isValid: true };
    }
    
    createFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item d-flex align-items-center justify-content-between p-2 border rounded mb-2';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name fw-medium';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size text-muted small';
        fileSize.textContent = this.formatFileSize(file.size);
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-sm btn-outline-danger';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.setAttribute('aria-label', `Remove ${file.name}`);
        
        removeButton.addEventListener('click', () => {
            this.removeFile(file, fileItem);
        });
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeButton);
        
        return fileItem;
    }
    
    removeFile(file, fileItem) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
        fileItem.remove();
        this.updateFileInput();
    }
    
    updateFileInput() {
        const fileInput = this.form.querySelector('#files');
        if (!fileInput) return;
        
        // Create new FileList
        const dt = new DataTransfer();
        this.uploadedFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Format based on country (simplified)
        if (value.startsWith('1')) {
            // US format: +1 (555) 123-4567
            value = value.substring(1);
            if (value.length >= 6) {
                value = `+1 (${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6, 10)}`;
            } else if (value.length >= 3) {
                value = `+1 (${value.substring(0, 3)}) ${value.substring(3)}`;
            } else {
                value = `+1 (${value}`;
            }
        }
        
        e.target.value = value;
    }
    
    updateCCInfo(e) {
        const purpose = e.target.value;
        const ccInfo = this.form.querySelector('.cc-info');
        
        const ccEmails = {
            'ai-ml-consulting': 'ai@didc.com',
            'enterprise-software': 'software@didc.com',
            'digital-transformation': 'transformation@didc.com',
            'cloud-services': 'cloud@didc.com',
            'data-analytics': 'analytics@didc.com',
            'cybersecurity': 'security@didc.com',
            'partnership': 'partnerships@didc.com',
            'careers': 'careers@didc.com',
            'media': 'press@didc.com'
        };
        
        if (ccInfo && ccEmails[purpose]) {
            ccInfo.textContent = `Your message will be forwarded to our ${purpose.replace('-', ' ')} team (${ccEmails[purpose]})`;
            ccInfo.style.display = 'block';
        } else if (ccInfo) {
            ccInfo.style.display = 'none';
        }
    }
    
    autoResizeTextarea(e) {
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    }
    
    updateCountrySpecificFields(e) {
        const country = e.target.value;
        const phoneInput = this.form.querySelector('#phone');
        
        // Update phone placeholder based on country
        if (phoneInput) {
            const phonePlaceholders = {
                'US': '+1 (555) 123-4567',
                'UK': '+44 20 7123 4567',
                'DE': '+49 30 12345678',
                'FR': '+33 1 23 45 67 89',
                'JP': '+81 3-1234-5678',
                'CN': '+86 138 0013 8000',
                'IN': '+91 98765 43210'
            };
            
            phoneInput.placeholder = phonePlaceholders[country] || '+1 (555) 123-4567';
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate all fields
        const isFormValid = this.validateForm();
        if (!isFormValid) {
            this.focusFirstError();
            return;
        }
        
        this.isSubmitting = true;
        this.showLoadingState();
        
        try {
            const formData = new FormData(this.form);
            
            // Add uploaded files
            this.uploadedFiles.forEach((file, index) => {
                formData.append(`files[${index}]`, file);
            });
            
            const response = await fetch('/api/contact.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showSuccessMessage();
                this.resetForm();
                this.trackEvent('form_submitted');
                this.formCompleted = true;
            } else {
                throw new Error(result.message || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError(error.message || 'An error occurred. Please try again.');
            this.trackEvent('form_error', { error: error.message });
        } finally {
            this.isSubmitting = false;
            this.hideLoadingState();
        }
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // Additional validation for consent
        const consentCheckbox = this.form.querySelector('#consent');
        if (consentCheckbox && !consentCheckbox.checked) {
            this.showError('You must agree to the terms and conditions');
            isValid = false;
        }
        
        return isValid;
    }
    
    focusFirstError() {
        const firstError = this.form.querySelector('.is-invalid');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    showLoadingState() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        }
        
        // Show progress indicator
        this.showMessage('Sending your message...', 'info');
    }
    
    hideLoadingState() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Message';
        }
    }
    
    showSuccessMessage() {
        this.showMessage(
            'Thank you for your message! We\'ll get back to you within 24 hours.',
            'success'
        );
        
        // Optional: redirect to thank you page
        setTimeout(() => {
            window.location.href = '/thank-you.html';
        }, 3000);
    }
    
    showError(message) {
        this.showMessage(message, 'danger');
    }
    
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message alert alert-${type} alert-dismissible fade show`;
        messageElement.setAttribute('role', 'alert');
        
        messageElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert before form
        this.form.parentNode.insertBefore(messageElement, this.form);
        
        // Auto-remove after delay (except for errors)
        if (type !== 'danger') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
        
        // Announce to screen readers
        if (this.errorAnnouncer) {
            this.errorAnnouncer.textContent = message;
        }
    }
    
    resetForm() {
        this.form.reset();
        this.uploadedFiles = [];
        
        // Clear file list
        const fileList = this.form.querySelector('.file-list');
        if (fileList) {
            fileList.innerHTML = '';
        }
        
        // Clear validation states
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
            const fieldGroup = input.closest('.form-group') || input.closest('.mb-3');
            if (fieldGroup) {
                fieldGroup.classList.remove('has-error', 'has-success');
                const errorMessage = fieldGroup.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });
    }
    
    getFieldLabel(field) {
        const label = this.form.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }
    
    trackEvent(eventName, data = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'contact_form',
                ...data
            });
        }
        
        // Custom analytics
        if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track(eventName, {
                category: 'contact_form',
                ...data
            });
        }
        
        // Console log for debugging
        console.log('Contact form event:', eventName, data);
    }
}

// Initialize form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = new ContactForm('contactForm');
    
    // Make globally available for debugging
    window.contactForm = contactForm;
});

// Progressive enhancement for browsers without JavaScript
document.documentElement.classList.add('js-enabled');
