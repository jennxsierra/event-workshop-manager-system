/**
 * Validation utility functions for client-side form validation
 */
const Validator = {
  /**
   * Validates an email address
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validates a phone number (optional field)
   * @param {string} phone - Phone to validate
   * @returns {boolean} - Whether phone is valid
   */
  isValidPhone(phone) {
    if (!phone) return true; // Optional field
    const re = /^\+?[0-9]{10,15}$/;
    return re.test(phone);
  },
  
  /**
   * Adds a toggle password visibility button (eye icon) to a password field
   * @param {string} passwordFieldId - ID of the password input field
   */
  setupPasswordToggle(passwordFieldId) {
    const passwordField = document.getElementById(passwordFieldId);
    if (!passwordField) return;
    
    // Create container for the password field with relative positioning
    const container = document.createElement('div');
    container.className = 'password-toggle-container position-relative';
    
    // Create the eye icon button
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn btn btn-outline-secondary bg-transparent border-0 position-absolute end-0 top-0 d-flex align-items-center h-100';
    toggleBtn.style.zIndex = '5';
    toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
    toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
    
    // Replace the password field with the container
    passwordField.parentNode.insertBefore(container, passwordField);
    container.appendChild(passwordField);
    container.appendChild(toggleBtn);
    
    // Setup the toggle functionality
    toggleBtn.addEventListener('click', () => {
      const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);
      toggleBtn.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });
  },

  /**
   * Validates a password strength
   * @param {string} password - Password to validate
   * @returns {boolean} - Whether password meets minimum requirements
   */
  isStrongPassword(password) {
    return password.length >= 8;
  },

  /**
   * Shows error message for a form field
   * @param {string} fieldId - ID of the field with error
   * @param {string} message - Error message to display
   */
  showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const errorDiv = document.createElement("div");
    errorDiv.className = "invalid-feedback d-block";
    errorDiv.textContent = message;

    // Remove existing error message if present
    const existingError = field.nextElementSibling;
    if (existingError && existingError.classList.contains("invalid-feedback")) {
      existingError.remove();
    }

    field.classList.add("is-invalid");
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  },

  /**
   * Clears validation errors from a form
   * @param {HTMLFormElement} form - The form to clear errors from
   */
  clearErrors(form) {
    const invalidFields = form.querySelectorAll(".is-invalid");
    const errorMessages = form.querySelectorAll(".invalid-feedback");

    invalidFields.forEach((field) => field.classList.remove("is-invalid"));
    errorMessages.forEach((msg) => msg.remove());
  },
};

/**
 * Initialize password toggles for all password fields on the page
 */
function initPasswordToggles() {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  passwordFields.forEach(field => {
    if (field.id) {
      Validator.setupPasswordToggle(field.id);
    }
  });
}

// Initialize password toggles when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
});

// Export for global use
window.Validator = Validator;
window.initPasswordToggles = initPasswordToggles;
