/**
 * JavaScript for user-related pages
 * Handles functionality for user profile, edit, and management
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check which user page we're on
  const userEditForm = document.querySelector('form[action="/users/profile"]');
  const userListPage = document.querySelector(".user-list-container");

  // Initialize appropriate functionality based on the page
  if (userEditForm) {
    initializeUserEditForm(userEditForm);
  } else if (userListPage) {
    initializeUserListPage();
  }
});

/**
 * Initialize the user edit form with validation
 * @param {HTMLFormElement} form - The user edit form
 */
function initializeUserEditForm(form) {
  // Setup form validation with FormHelpers if available
  if (window.FormHelpers) {
    FormHelpers.setupValidation('form[action="/users/profile"]', {
      firstName: {
        required: true,
        minLength: 2,
      },
      lastName: {
        required: true,
        minLength: 2,
      },
      email: {
        required: true,
        email: true,
      },
      username: {
        required: true,
        minLength: 3,
      },
      phone: {
        phone: true, // Optional, but validate if provided
      },
      password: {
        minLength: 8, // Only validate if not empty
      },
    });
  } else {
    // Fallback validation if FormHelpers is not available
    form.addEventListener("submit", (e) => {
      if (!validateUserForm(form)) {
        e.preventDefault();
      }
    });
  }

  // Add password strength meter if password field exists
  const passwordField = document.getElementById("password");
  if (passwordField) {
    initializePasswordStrengthMeter(passwordField);
  }
}

/**
 * Initialize password strength meter
 * @param {HTMLInputElement} passwordField - Password input field
 */
function initializePasswordStrengthMeter(passwordField) {
  // Create strength meter element if it doesn't exist
  let meterContainer = passwordField.nextElementSibling;
  if (
    !meterContainer ||
    !meterContainer.classList.contains("password-strength-meter")
  ) {
    meterContainer = document.createElement("div");
    meterContainer.className = "password-strength-meter mt-2 d-none";
    meterContainer.innerHTML = `
      <div class="progress" style="height: 5px;">
        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
      </div>
      <small class="form-text mt-1">Password strength: <span class="strength-text">None</span></small>
    `;

    passwordField.parentNode.insertBefore(
      meterContainer,
      passwordField.nextSibling
    );
  }

  // Update meter on password input
  passwordField.addEventListener("input", () => {
    const password = passwordField.value;
    const strength = calculatePasswordStrength(password);

    // Only show meter if user has started typing
    if (password) {
      meterContainer.classList.remove("d-none");

      // Update progress bar
      const progressBar = meterContainer.querySelector(".progress-bar");
      progressBar.style.width = `${strength.percent}%`;

      // Update strength text
      const strengthText = meterContainer.querySelector(".strength-text");
      strengthText.textContent = strength.label;

      // Update colors
      progressBar.className = "progress-bar " + strength.colorClass;
    } else {
      meterContainer.classList.add("d-none");
    }
  });
}

/**
 * Calculate password strength
 * @param {string} password - Password to evaluate
 * @returns {Object} - Strength information
 */
function calculatePasswordStrength(password) {
  if (!password) {
    return { percent: 0, label: "None", colorClass: "" };
  }

  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;

  // Character type checks
  if (/[A-Z]/.test(password)) strength += 15; // Uppercase
  if (/[a-z]/.test(password)) strength += 10; // Lowercase
  if (/[0-9]/.test(password)) strength += 15; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Special chars

  // Determine label and color class
  let label, colorClass;
  if (strength < 30) {
    label = "Very weak";
    colorClass = "bg-danger";
  } else if (strength < 50) {
    label = "Weak";
    colorClass = "bg-warning";
  } else if (strength < 70) {
    label = "Medium";
    colorClass = "bg-info";
  } else if (strength < 90) {
    label = "Strong";
    colorClass = "bg-primary";
  } else {
    label = "Very strong";
    colorClass = "bg-success";
  }

  return { percent: strength, label, colorClass };
}

/**
 * Fallback validation for user form
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateUserForm(form) {
  if (!window.Validator) return true;

  Validator.clearErrors(form);
  let isValid = true;

  // Get form fields
  const firstName = form.elements["firstName"].value.trim();
  const lastName = form.elements["lastName"].value.trim();
  const email = form.elements["email"].value.trim();
  const username = form.elements["username"].value.trim();
  const phone = form.elements["phone"]?.value.trim();
  const password = form.elements["password"]?.value;

  // Validate required fields
  if (!firstName) {
    Validator.showError("firstName", "First name is required");
    isValid = false;
  } else if (firstName.length < 2) {
    Validator.showError(
      "firstName",
      "First name must be at least 2 characters"
    );
    isValid = false;
  }

  if (!lastName) {
    Validator.showError("lastName", "Last name is required");
    isValid = false;
  } else if (lastName.length < 2) {
    Validator.showError("lastName", "Last name must be at least 2 characters");
    isValid = false;
  }

  if (!email) {
    Validator.showError("email", "Email is required");
    isValid = false;
  } else if (!Validator.isValidEmail(email)) {
    Validator.showError("email", "Please enter a valid email address");
    isValid = false;
  }

  if (!username) {
    Validator.showError("username", "Username is required");
    isValid = false;
  } else if (username.length < 3) {
    Validator.showError("username", "Username must be at least 3 characters");
    isValid = false;
  }

  // Validate optional fields if provided
  if (phone && !Validator.isValidPhone(phone)) {
    Validator.showError("phone", "Please enter a valid phone number");
    isValid = false;
  }

  // Password is only required on registration, not on profile edit
  if (password && password.length < 8) {
    Validator.showError("password", "Password must be at least 8 characters");
    isValid = false;
  }

  return isValid;
}

/**
 * Initialize the user list page
 */
function initializeUserListPage() {
  // Initialize sortable and searchable user table if present
  if (window.TableHelpers) {
    const userTable = document.getElementById("user-table");
    const searchInput = document.getElementById("user-search");

    if (userTable) {
      TableHelpers.initSortableTable("user-table");
    }

    if (userTable && searchInput) {
      TableHelpers.initSearchableTable("user-table", "user-search", {
        columns: [1, 2, 3, 4, 5], // Skip action column
      });
    }
  }

  // Setup delete user confirmation using modals if available
  if (window.DOM) {
    DOM.addEventListeners(".delete-user-btn", "click", function (e) {
      e.preventDefault();

      const userId = this.dataset.userId;
      const username = this.dataset.username || "this user";

      DOM.confirm(`Are you sure you want to delete ${username}?`, () => {
        window.location.href = `/users/delete/${userId}`;
      });
    });
  }
}
