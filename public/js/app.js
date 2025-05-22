/**
 * Main JavaScript file for the Event & Workshop Management System
 * This file is loaded on every page and initializes common functionality
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Bootstrap components
  if (window.Utils) {
    // Initialize tooltips and popovers
    Utils.initTooltips();
    Utils.initPopovers();
    Utils.initDropdowns(); // Initialize Bootstrap dropdowns

    // Setup flash message auto-dismissal
    Utils.setupFlashMessages(5000); // Dismiss after 5 seconds
  }

  // Set up global event handlers
  setupGlobalEventHandlers();

  // Set up form validation for forms with data-validate attribute
  setupFormValidation();

  console.log("Event & Workshop Management System initialized");
});

/**
 * Sets up event handlers that apply to the entire site
 */
function setupGlobalEventHandlers() {
  // Confirm dialogs for delete buttons or links
  if (window.DOM) {
    DOM.addEventListeners("[data-confirm]", "click", function (e) {
      const message =
        this.dataset.confirm || "Are you sure you want to proceed?";

      // Use the DOM helper to show a confirmation dialog
      DOM.confirm(
        message,
        () => {
          // Continue with the action if confirmed
        },
        () => {
          // Prevent the default action if canceled
          e.preventDefault();
        }
      );
    });
  }
}

/**
 * Sets up form validation for forms with the data-validate attribute
 */
function setupFormValidation() {
  const forms = document.querySelectorAll("form[data-validate]");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });
  });
}

/**
 * Validates a form based on HTML5 validation attributes
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
  if (!window.Validator) return true;

  Validator.clearErrors(form);
  let isValid = true;

  // Get all form inputs
  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    // Skip inputs that are disabled, readonly, or button types
    if (
      input.disabled ||
      input.readOnly ||
      input.type === "button" ||
      input.type === "submit" ||
      input.type === "reset"
    ) {
      return;
    }

    const value = input.value.trim();
    const id = input.id || input.name;

    // Required validation
    if (input.required && value === "") {
      Validator.showError(id, "This field is required");
      isValid = false;
      return;
    }

    // Email validation
    if (input.type === "email" && value && !Validator.isValidEmail(value)) {
      Validator.showError(id, "Please enter a valid email address");
      isValid = false;
    }

    // Phone validation if has data-phone attribute
    if (
      input.dataset.phone !== undefined &&
      value &&
      !Validator.isValidPhone(value)
    ) {
      Validator.showError(id, "Please enter a valid phone number");
      isValid = false;
    }

    // Min length validation
    if (input.minLength && value.length < input.minLength) {
      Validator.showError(id, `Must be at least ${input.minLength} characters`);
      isValid = false;
    }

    // Max length validation - already handled by the browser, but we can add it here too
    if (input.maxLength && value.length > input.maxLength) {
      Validator.showError(id, `Cannot exceed ${input.maxLength} characters`);
      isValid = false;
    }
  });

  return isValid;
}
