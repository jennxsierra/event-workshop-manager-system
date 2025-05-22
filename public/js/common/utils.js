/**
 * General utility functions for the application
 */
const Utils = {
  /**
   * Initialize Bootstrap tooltips
   */
  initTooltips() {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    if (tooltipTriggerList.length > 0) {
      Array.from(tooltipTriggerList).map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
      );
    }
  },

  /**
   * Initialize Bootstrap popovers
   */
  initPopovers() {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );
    if (popoverTriggerList.length > 0) {
      Array.from(popoverTriggerList).map(
        (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
      );
    }
  },
  
  /**
   * Initialize Bootstrap dropdowns
   */
  initDropdowns() {
    const dropdownTriggerList = document.querySelectorAll(
      '[data-bs-toggle="dropdown"]'
    );
    if (dropdownTriggerList.length > 0) {
      Array.from(dropdownTriggerList).map(
        (dropdownTriggerEl) => new bootstrap.Dropdown(dropdownTriggerEl)
      );
    }
  },

  /**
   * Setup automatic dismissal of flash messages
   * @param {number} delay - Time in milliseconds before auto-dismiss
   */
  setupFlashMessages(delay = 5000) {
    const flashMessages = document.querySelectorAll(".alert-dismissible");
    flashMessages.forEach((alert) => {
      // Auto-dismiss after delay
      setTimeout(() => {
        alert.classList.add("fade");
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 500);
      }, delay);
    });
  },

  /**
   * Format a date for display
   * @param {string|Date} date - Date to format
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} - Formatted date string
   */
  formatDate(date, options = {}) {
    if (!date) return "";

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      ...defaultOptions,
      ...options,
    }).format(dateObj);
  },

  /**
   * Debounce a function call
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

// Export for global use
window.Utils = Utils;
