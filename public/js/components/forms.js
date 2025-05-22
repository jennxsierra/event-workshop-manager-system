/**
 * Form component JavaScript handling
 * Contains functionality for working with forms across the application
 */

const FormHelpers = {
  /**
   * Add custom validation to a form
   * @param {string} formSelector - CSS selector for the form
   * @param {Object} rules - Object containing validation rules
   * @param {Function} onSubmit - Function to call on successful submission
   */
  setupValidation(formSelector, rules, onSubmit = null) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    form.addEventListener("submit", (e) => {
      // Clear previous validation errors
      if (window.Validator) {
        Validator.clearErrors(form);
      }

      // Validate the form against provided rules
      const isValid = this.validateFormWithRules(form, rules);

      if (isValid) {
        // Call onSubmit if provided and form is valid
        if (onSubmit && typeof onSubmit === "function") {
          onSubmit(form, e);
        }
      } else {
        // Prevent form submission if invalid
        e.preventDefault();
      }
    });
  },

  /**
   * Validate a form based on provided rules
   * @param {HTMLFormElement} form - Form to validate
   * @param {Object} rules - Validation rules to apply
   * @returns {boolean} - Whether the form is valid
   */
  validateFormWithRules(form, rules) {
    if (!window.Validator) return true;

    let isValid = true;

    // Process each field in the rules object
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const field = form.elements[fieldName];
      if (!field) return;

      const value = field.value.trim();
      const fieldId = field.id || fieldName;

      // Check each rule for the field
      Object.entries(fieldRules).forEach(([ruleName, ruleValue]) => {
        // Skip empty fields for optional rules
        if (!value && ruleName !== "required") return;

        let errorMessage = "";
        let ruleValid = true;

        switch (ruleName) {
          case "required":
            ruleValid = value !== "";
            errorMessage =
              ruleValue === true ? "This field is required" : ruleValue;
            break;

          case "email":
            ruleValid = Validator.isValidEmail(value);
            errorMessage =
              ruleValue === true
                ? "Please enter a valid email address"
                : ruleValue;
            break;

          case "phone":
            ruleValid = Validator.isValidPhone(value);
            errorMessage =
              ruleValue === true
                ? "Please enter a valid phone number"
                : ruleValue;
            break;

          case "minLength":
            ruleValid = value.length >= ruleValue;
            errorMessage = `Must be at least ${ruleValue} characters`;
            break;

          case "maxLength":
            ruleValid = value.length <= ruleValue;
            errorMessage = `Cannot exceed ${ruleValue} characters`;
            break;

          case "match":
            const matchField = form.elements[ruleValue];
            ruleValid = matchField && value === matchField.value.trim();
            errorMessage = `Must match ${
              matchField ? matchField.name || ruleValue : ruleValue
            }`;
            break;

          case "custom":
            if (typeof ruleValue === "function") {
              ruleValid = ruleValue(value, field, form);
              errorMessage = "Invalid input";
            }
            break;
        }

        if (!ruleValid) {
          Validator.showError(fieldId, errorMessage);
          isValid = false;
        }
      });
    });

    return isValid;
  },

  /**
   * Initialize AJAX form submission
   * @param {string} formSelector - CSS selector for the form
   * @param {Object} options - Configuration options
   */
  setupAjaxForm(formSelector, options = {}) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const {
      onSuccess = null,
      onError = null,
      beforeSubmit = null,
      method = null,
      url = null,
    } = options;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Execute beforeSubmit if provided
      if (beforeSubmit && typeof beforeSubmit === "function") {
        const shouldContinue = beforeSubmit(form);
        if (shouldContinue === false) return;
      }

      try {
        const formData = new FormData(form);
        const response = await fetch(url || form.action, {
          method: method || form.method || "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          if (onSuccess && typeof onSuccess === "function") {
            onSuccess(result, form);
          }
        } else {
          if (onError && typeof onError === "function") {
            onError(result, form);
          } else {
            console.error("Form submission error:", result);
          }
        }
      } catch (error) {
        console.error("Form submission error:", error);
        if (onError && typeof onError === "function") {
          onError({ message: "An unexpected error occurred" }, form);
        }
      }
    });
  },
};

// Export for global use
window.FormHelpers = FormHelpers;
