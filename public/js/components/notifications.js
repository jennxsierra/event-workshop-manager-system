/**
 * Notification component for displaying modal notifications
 * Provides functionality for showing modal-based notifications instead of alert banners
 */

const NotificationCenter = {
  /**
   * Show a notification modal
   * @param {Object} options - Notification options
   * @param {string} options.type - Type of notification: 'success', 'error', 'info', 'warning'
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification message
   * @param {boolean} options.autoClose - Whether to automatically close the notification
   * @param {number} options.duration - Duration in milliseconds before auto-close
   * @returns {Object} - The modal instance
   */
  show(options = {}) {
    const id = "notification-modal-" + Date.now();
    const type = options.type || 'info';
    const title = options.title || this.getDefaultTitle(type);
    const message = options.message || '';
    const autoClose = options.autoClose !== false;
    const duration = options.duration || 4000;

    // Create modal element
    const modal = document.createElement("div");
    modal.id = id;
    modal.className = "modal fade notification-modal";
    modal.tabIndex = -1;
    modal.role = "dialog";
    modal.setAttribute("aria-hidden", "true");

    // Set icon based on notification type
    const icon = this.getIconForType(type);

    // Create modal content
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-${this.getColorForType(type)} text-white">
            <h5 class="modal-title">
              <i class="bi ${icon} me-2"></i>
              ${title}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">${message}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(modal);

    // Initialize modal
    const modalInstance = new bootstrap.Modal(modal);

    // Setup event handlers for cleanup
    modal.addEventListener("hidden.bs.modal", () => {
      document.body.removeChild(modal);
    });

    // Show the modal
    modalInstance.show();

    // Auto-close if enabled
    if (autoClose) {
      setTimeout(() => {
        modalInstance.hide();
      }, duration);
    }

    return modalInstance;
  },

  /**
   * Show a success notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   */
  success(message, title = 'Success', options = {}) {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  },

  /**
   * Show an error notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   */
  error(message, title = 'Error', options = {}) {
    return this.show({
      type: 'error',
      title,
      message,
      ...options
    });
  },

  /**
   * Show an info notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   */
  info(message, title = 'Information', options = {}) {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  },

  /**
   * Show a warning notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {Object} options - Additional options
   */
  warning(message, title = 'Warning', options = {}) {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  },

  /**
   * Get the default title for a notification type
   * @param {string} type - Notification type
   * @returns {string} - Default title
   */
  getDefaultTitle(type) {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      default: return 'Information';
    }
  },

  /**
   * Get Bootstrap icon class for a notification type
   * @param {string} type - Notification type
   * @returns {string} - Icon class
   */
  getIconForType(type) {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-exclamation-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      default: return 'bi-info-circle-fill';
    }
  },

  /**
   * Get Bootstrap color class for a notification type
   * @param {string} type - Notification type
   * @returns {string} - Color class
   */
  getColorForType(type) {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
};

// Export for global use
window.NotificationCenter = NotificationCenter;
