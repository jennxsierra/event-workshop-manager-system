/**
 * DOM manipulation and interaction utilities
 */
const DOM = {
  /**
   * Show a confirmation dialog
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Callback if user confirms
   * @param {Function} onCancel - Callback if user cancels
   */
  confirm(message, onConfirm, onCancel = () => {}) {
    if (window.confirm(message)) {
      onConfirm();
    } else {
      onCancel();
    }
  },

  /**
   * Add event listeners to multiple elements
   * @param {string} selector - CSS selector for elements
   * @param {string} eventType - Type of event to listen for
   * @param {Function} handler - Event handler function
   */
  addEventListeners(selector, eventType, handler) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener(eventType, handler);
    });
  },

  /**
   * Toggle visibility of an element
   * @param {string|HTMLElement} element - Element or selector to toggle
   * @param {boolean} show - Whether to show or hide
   */
  toggleVisibility(element, show) {
    const el =
      typeof element === "string" ? document.querySelector(element) : element;
    if (!el) return;

    if (show) {
      el.classList.remove("d-none");
    } else {
      el.classList.add("d-none");
    }
  },

  /**
   * Create an HTML element with attributes and content
   * @param {string} tag - HTML tag name
   * @param {object} attributes - HTML attributes to set
   * @param {string|HTMLElement} content - Content to insert
   * @returns {HTMLElement} - Created element
   */
  createElement(tag, attributes = {}, content = "") {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "class") {
        value.split(" ").forEach((cls) => element.classList.add(cls));
      } else {
        element.setAttribute(key, value);
      }
    });

    // Set content
    if (content) {
      if (typeof content === "string") {
        element.innerHTML = content;
      } else {
        element.appendChild(content);
      }
    }

    return element;
  },
};

// Export for global use
window.DOM = DOM;
