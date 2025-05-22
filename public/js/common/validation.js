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

// Export for global use
window.Validator = Validator;
