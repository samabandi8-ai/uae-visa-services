// API Configuration
// Automatically detect environment and use appropriate API URL
const API_BASE_URL = (() => {
    // If running on Render or other production environment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Extract the base domain and construct backend URL
        const hostname = window.location.hostname;
        if (hostname.includes('onrender.com')) {
            // For Render deployment, assume backend is at uae-visa-backend.onrender.com
            return 'https://uae-visa-services.onrender.com/api';
        }
        // For other production environments, try same domain with /api
        return `${window.location.protocol}//${hostname}/api`;
    }
    // Local development
    return 'http://localhost:3000/api';
})();

// API Helper Functions
class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        console.log('API Client initialized with URL:', this.baseURL);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', {
                url: url,
                error: error.message,
                stack: error.stack
            });
            
            // Provide more helpful error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(`Cannot connect to backend server at ${this.baseURL}. Please check if the backend is running.`);
            }
            
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async postFormData(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }
}

const api = new APIClient();

// Form Submission Handlers
class FormHandler {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Visa Application Form
        const visaForm = document.getElementById('visa-application-form');
        if (visaForm) {
            visaForm.addEventListener('submit', this.handleVisaApplication.bind(this));
        }

        // Contact Form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }

        // Feedback Form
        const feedbackForm = document.getElementById('feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', this.handleFeedbackForm.bind(this));
        }

        // Newsletter Form
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', this.handleNewsletterForm.bind(this));
        });
    }

    async handleVisaApplication(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting Application...';

            // Create FormData object
            const formData = new FormData(form);

            // Submit application
            const response = await api.postFormData('/visa-application', formData);

            // Show success message
            this.showMessage('success', `Application submitted successfully! Your application ID is: ${response.applicationId}. You will receive a confirmation email shortly.`);
            
            // Reset form
            form.reset();

        } catch (error) {
            this.showMessage('error', `Failed to submit application: ${error.message}`);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async handleContactForm(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Message...';

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Submit contact message
            const response = await api.post('/contact', data);

            // Show success message
            this.showMessage('success', 'Message sent successfully! We will get back to you soon.');
            
            // Reset form
            form.reset();

        } catch (error) {
            this.showMessage('error', `Failed to send message: ${error.message}`);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async handleFeedbackForm(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting Feedback...';

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Handle checkbox arrays
            const aspectsImpressed = formData.getAll('aspectsImpressed');
            if (aspectsImpressed.length > 0) {
                data.aspectsImpressed = aspectsImpressed;
            }

            // Submit feedback
            const response = await api.post('/feedback', data);

            // Show success message
            this.showMessage('success', 'Thank you for your feedback! Your review will be published after approval.');
            
            // Reset form
            form.reset();

        } catch (error) {
            this.showMessage('error', `Failed to submit feedback: ${error.message}`);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async handleNewsletterForm(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Handle subscription types
            const subscriptionTypes = formData.getAll('subscriptionTypes');
            if (subscriptionTypes.length > 0) {
                data.subscriptionTypes = subscriptionTypes;
            }

            // Submit subscription
            const response = await api.post('/newsletter', data);

            // Show success message
            this.showMessage('success', 'Successfully subscribed to newsletter!');
            
            // Reset form
            form.reset();

        } catch (error) {
            this.showMessage('error', `Failed to subscribe: ${error.message}`);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showMessage(type, message) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.api-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `api-message api-message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${type === 'success' ? '✓' : '✗'}</span>
                <span class="message-text">${message}</span>
                <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 
                'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
                'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;

        // Add animation styles
        if (!document.getElementById('api-message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'api-message-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .message-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .message-icon {
                    font-weight: bold;
                    font-size: 16px;
                }
                .message-text {
                    flex: 1;
                }
                .message-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                }
                .message-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Application Status Checker
class StatusChecker {
    constructor() {
        this.initializeStatusChecker();
    }

    initializeStatusChecker() {
        const statusForm = document.getElementById('status-check-form');
        if (statusForm) {
            statusForm.addEventListener('submit', this.checkApplicationStatus.bind(this));
        }
    }

    async checkApplicationStatus(event) {
        event.preventDefault();
        const form = event.target;
        const applicationId = form.querySelector('#applicationId').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const resultDiv = document.getElementById('status-result');

        if (!applicationId) {
            this.showStatusResult('error', 'Please enter a valid application ID.');
            return;
        }

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Checking Status...';
            resultDiv.innerHTML = '';

            // Check application status
            const response = await api.get(`/application-status/${applicationId}`);

            // Show status result
            this.showStatusResult('success', response);

        } catch (error) {
            this.showStatusResult('error', error.message);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showStatusResult(type, data) {
        const resultDiv = document.getElementById('status-result');
        if (!resultDiv) return;

        if (type === 'error') {
            resultDiv.innerHTML = `
                <div class="status-error">
                    <h4>Error</h4>
                    <p>${data}</p>
                </div>
            `;
        } else {
            const application = data.application;
            resultDiv.innerHTML = `
                <div class="status-success">
                    <h4>Application Status</h4>
                    <div class="status-details">
                        <p><strong>Application ID:</strong> ${application.id}</p>
                        <p><strong>Name:</strong> ${application.firstName} ${application.lastName}</p>
                        <p><strong>Visa Type:</strong> ${application.visaType}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${application.status}">${application.status}</span></p>
                        <p><strong>Submitted:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
                        <p><strong>Email:</strong> ${application.email}</p>
                        <p><strong>Phone:</strong> ${application.phone}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Public Feedback Loader
class FeedbackLoader {
    constructor() {
        this.loadPublicFeedback();
    }

    async loadPublicFeedback() {
        const feedbackContainer = document.getElementById('public-feedback-container');
        if (!feedbackContainer) return;

        try {
            const response = await api.get('/public-feedback');
            this.displayFeedback(response.feedback, feedbackContainer);
        } catch (error) {
            console.error('Failed to load public feedback:', error);
            feedbackContainer.innerHTML = '<p>Unable to load feedback at this time.</p>';
        }
    }

    displayFeedback(feedbackList, container) {
        if (!feedbackList || feedbackList.length === 0) {
            container.innerHTML = '<p>No feedback available yet.</p>';
            return;
        }

        const feedbackHTML = feedbackList.map(feedback => `
            <div class="feedback-card">
                <div class="feedback-header">
                    <h4>${feedback.name}</h4>
                    <div class="rating">
                        ${'★'.repeat(feedback.overallRating)}${'☆'.repeat(5 - feedback.overallRating)}
                    </div>
                </div>
                <div class="feedback-content">
                    <h5>${feedback.feedbackTitle}</h5>
                    <p>${feedback.feedbackMessage}</p>
                </div>
                <div class="feedback-meta">
                    <span class="visa-type">${feedback.visaType}</span>
                    <span class="date">${new Date(feedback.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = feedbackHTML;
    }
}

// Health Check
class HealthChecker {
    constructor() {
        this.checkAPIHealth();
    }

    async checkAPIHealth() {
        try {
            const response = await api.get('/health');
            console.log('API Health Check:', response);
            this.showAPIStatus('online');
        } catch (error) {
            console.error('API Health Check failed:', error);
            this.showAPIStatus('offline');
        }
    }

    showAPIStatus(status) {
        const statusIndicators = document.querySelectorAll('.api-status');
        statusIndicators.forEach(indicator => {
            indicator.className = `api-status api-status-${status}`;
            indicator.textContent = status === 'online' ? 'API Online' : 'API Offline';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    new FormHandler();
    new StatusChecker();
    new FeedbackLoader();
    new HealthChecker();

    console.log('API Client initialized successfully');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api, FormHandler, StatusChecker, FeedbackLoader, HealthChecker };
}
