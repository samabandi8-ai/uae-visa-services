// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Smooth Scrolling for Anchor Links
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

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#FFFFFF';
        header.style.backdropFilter = 'none';
    }
});

// Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .news-card, .hero-content').forEach(el => {
    observer.observe(el);
});

// Form Validation and Submission
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;

    requiredFields.forEach(field => {
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }

        if (!field.value.trim()) {
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
            showFieldError(field, 'This field is required');
        } else {
            // Specific validations
            if (field.type === 'email' && !isValidEmail(field.value)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                showFieldError(field, 'Please enter a valid email address');
            }
            if (field.type === 'tel' && !isValidPhone(field.value)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                showFieldError(field, 'Please enter a valid phone number');
            }
        }
    });

    if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#FF0000';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#FF0000';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// File Upload Handler
function handleFileUpload(input) {
    const file = input.files[0];
    const label = input.parentNode.querySelector('.file-upload-label');
    
    if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('File size should not exceed 5MB');
            input.value = '';
            return;
        }
        
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload only PDF, DOC, DOCX, JPG, or PNG files');
            input.value = '';
            return;
        }
        
        label.innerHTML = `<i class="fas fa-check-circle"></i> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        label.style.background = 'rgba(0, 115, 47, 0.1)';
        label.style.borderColor = '#00732F';
        label.style.color = '#00732F';
    } else {
        label.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Click to upload or drag and drop';
        label.style.background = 'rgba(255,0,0,0.05)';
        label.style.borderColor = '#FF0000';
        label.style.color = '#333';
    }
}

// Add event listeners for file inputs
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', () => handleFileUpload(input));
    });
});

// Form Submission Handler
function submitForm(formId, successMessage = 'Form submitted successfully!') {
    if (!validateForm(formId)) {
        return false;
    }

    const form = document.getElementById(formId);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Reset file upload labels
        form.querySelectorAll('.file-upload-label').forEach(label => {
            label.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Click to upload or drag and drop';
            label.style.background = 'rgba(255,0,0,0.05)';
            label.style.borderColor = '#FF0000';
            label.style.color = '#333';
        });

        // Show success message
        showNotification(successMessage, 'success');

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);

    return false; // Prevent default form submission
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00732F' : type === 'error' ? '#FF0000' : '#007bff'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Search Functionality
function searchContent(query) {
    const searchResults = [];
    const content = document.body.textContent.toLowerCase();
    const queryLower = query.toLowerCase();

    if (content.includes(queryLower)) {
        // Simple search implementation
        const elements = document.querySelectorAll('h1, h2, h3, p, li');
        elements.forEach(element => {
            if (element.textContent.toLowerCase().includes(queryLower)) {
                searchResults.push({
                    element: element,
                    text: element.textContent.trim(),
                    type: element.tagName.toLowerCase()
                });
            }
        });
    }

    return searchResults;
}

// Utility Functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function formatCurrency(amount, currency = 'AED') {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation to images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('fade-in');
        });
    });

    // Initialize tooltips if needed
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
});

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
    `;
    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        delete e.target._tooltip;
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        submitForm,
        showNotification,
        searchContent,
        formatDate,
        formatCurrency
    };
}