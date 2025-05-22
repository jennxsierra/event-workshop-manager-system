/**
 * JavaScript for event-related pages
 * Handles functionality for event display, creation, editing, and registration
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check which event page we're on
  const eventForm = document.querySelector(
    'form[action^="/events"][action$="/create"], form[action*="/update"]'
  );
  const eventDetails = document.querySelector(".event-details-container");
  const eventsList = document.querySelector(".events-list-container");

  // Initialize appropriate functionality based on the page
  if (eventForm) {
    initializeEventForm(eventForm);
  } else if (eventDetails) {
    initializeEventDetailsPage();
  } else if (eventsList) {
    initializeEventsListPage();
  }
});

/**
 * Initialize the event creation/edit form
 * @param {HTMLFormElement} form - Event form
 */
function initializeEventForm(form) {
  // Setup datetime pickers
  const dateTimeFields = form.querySelectorAll('input[type="datetime-local"]');
  dateTimeFields.forEach((field) => {
    // You can add custom date picker initialization here if needed
  });

  // Setup form validation with FormHelpers if available
  if (window.FormHelpers) {
    FormHelpers.setupValidation("form", {
      title: {
        required: true,
        minLength: 5,
      },
      description: {
        required: true,
        minLength: 20,
      },
      startDate: {
        required: true,
        custom: validateEventDates,
      },
      endDate: {
        required: true,
        custom: validateEventDates,
      },
      location: {
        required: true,
      },
      capacity: {
        required: true,
        custom: (value) => parseInt(value) > 0,
      },
    });
  } else {
    // Fallback validation if FormHelpers is not available
    form.addEventListener("submit", (e) => {
      if (!validateEventForm(form)) {
        e.preventDefault();
      }
    });
  }
}

/**
 * Validate event dates (start date must be before end date)
 * @param {string} value - Field value
 * @param {HTMLInputElement} field - Field element
 * @param {HTMLFormElement} form - Parent form
 * @returns {boolean} - Whether dates are valid
 */
function validateEventDates(value, field, form) {
  const startDate = new Date(form.elements["startDate"].value);
  const endDate = new Date(form.elements["endDate"].value);

  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return false;
  }

  // If validating start date
  if (field.name === "startDate") {
    if (startDate > endDate) {
      Validator.showError("startDate", "Start date must be before end date");
      return false;
    }
  }

  // If validating end date
  if (field.name === "endDate") {
    if (endDate < startDate) {
      Validator.showError("endDate", "End date must be after start date");
      return false;
    }
  }

  return true;
}

/**
 * Fallback validation for event form
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateEventForm(form) {
  if (!window.Validator) return true;

  Validator.clearErrors(form);
  let isValid = true;

  // Get form fields
  const title = form.elements["title"].value.trim();
  const description = form.elements["description"].value.trim();
  const startDate = form.elements["startDate"].value;
  const endDate = form.elements["endDate"].value;
  const location = form.elements["location"].value.trim();
  const capacity = form.elements["capacity"].value;

  // Basic validations
  if (!title) {
    Validator.showError("title", "Title is required");
    isValid = false;
  } else if (title.length < 5) {
    Validator.showError("title", "Title must be at least 5 characters");
    isValid = false;
  }

  if (!description) {
    Validator.showError("description", "Description is required");
    isValid = false;
  } else if (description.length < 20) {
    Validator.showError(
      "description",
      "Description must be at least 20 characters"
    );
    isValid = false;
  }

  if (!location) {
    Validator.showError("location", "Location is required");
    isValid = false;
  }

  if (!capacity || parseInt(capacity) <= 0) {
    Validator.showError("capacity", "Capacity must be a positive number");
    isValid = false;
  }

  // Date validation
  if (!startDate) {
    Validator.showError("startDate", "Start date is required");
    isValid = false;
  }

  if (!endDate) {
    Validator.showError("endDate", "End date is required");
    isValid = false;
  }

  // Compare dates if both are provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      Validator.showError("startDate", "Start date must be before end date");
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Initialize the event details page
 */
function initializeEventDetailsPage() {
  // Handle registration button
  const registerBtn = document.querySelector(".register-event-btn");
  if (registerBtn) {
    registerBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const eventId = registerBtn.dataset.eventId;

      // Use ModalHelpers for confirmation if available
      if (window.ModalHelpers) {
        const confirmed = await ModalHelpers.confirm({
          title: "Confirm Registration",
          message: "Are you sure you want to register for this event?",
          confirmText: "Register",
          cancelText: "Cancel",
        });

        if (confirmed) {
          window.location.href = `/events/${eventId}/register`;
        }
      } else {
        // Fallback to standard confirmation
        if (confirm("Are you sure you want to register for this event?")) {
          window.location.href = `/events/${eventId}/register`;
        }
      }
    });
  }
}

/**
 * Initialize the events list page
 */
function initializeEventsListPage() {
  // Initialize sortable and searchable events table
  if (window.TableHelpers) {
    const eventsTable = document.getElementById("events-table");
    const searchInput = document.getElementById("events-search");

    if (eventsTable) {
      TableHelpers.initSortableTable("events-table");
    }

    if (eventsTable && searchInput) {
      TableHelpers.initSearchableTable("events-table", "events-search");
    }
  }

  // Setup event filters if present
  const filterForm = document.querySelector(".events-filter-form");
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applyEventFilters();
    });

    // Reset filters button
    const resetBtn = filterForm.querySelector(".reset-filters");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        filterForm.reset();
        applyEventFilters();
      });
    }
  }
}

/**
 * Apply filters to events list
 */
function applyEventFilters() {
  const filterForm = document.querySelector(".events-filter-form");
  if (!filterForm) return;

  const formData = new FormData(filterForm);
  const params = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (value) {
      // Only add non-empty values
      params.append(key, value);
    }
  }

  // Redirect to the filtered URL
  window.location.href = `/events?${params.toString()}`;
}
