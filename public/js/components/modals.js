/**
 * Modal component JavaScript handling
 * Provides functionality for managing Bootstrap modals and custom modal behavior
 */

const ModalHelpers = {
  /**
   * Initialize a modal with custom behavior
   * @param {string} modalId - ID of the modal element
   * @param {Object} options - Configuration options
   */
  initModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return null;

    // Get or create the Bootstrap modal instance
    let modalInstance = bootstrap.Modal.getInstance(modal);
    if (!modalInstance) {
      modalInstance = new bootstrap.Modal(modal, {
        keyboard: options.keyboard !== false,
        backdrop:
          options.backdrop !== false
            ? options.backdrop === "static"
              ? "static"
              : true
            : false,
      });
    }

    // Set up event handlers if provided
    if (options.onShow && typeof options.onShow === "function") {
      modal.addEventListener("shown.bs.modal", options.onShow);
    }

    if (options.onHide && typeof options.onHide === "function") {
      modal.addEventListener("hidden.bs.modal", options.onHide);
    }

    return modalInstance;
  },

  /**
   * Open a modal with dynamic content
   * @param {string} modalId - ID of the modal element
   * @param {Object} content - Content to fill in the modal
   */
  openModal(modalId, content = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Update modal content if provided
    if (content.title) {
      const titleEl = modal.querySelector(".modal-title");
      if (titleEl) titleEl.textContent = content.title;
    }

    if (content.body) {
      const bodyEl = modal.querySelector(".modal-body");
      if (bodyEl) {
        if (typeof content.body === "string") {
          bodyEl.innerHTML = content.body;
        } else if (content.body instanceof Element) {
          bodyEl.innerHTML = "";
          bodyEl.appendChild(content.body);
        }
      }
    }

    if (content.footer) {
      const footerEl = modal.querySelector(".modal-footer");
      if (footerEl) {
        if (typeof content.footer === "string") {
          footerEl.innerHTML = content.footer;
        } else if (content.footer instanceof Element) {
          footerEl.innerHTML = "";
          footerEl.appendChild(content.footer);
        }
      }
    }

    // Show the modal
    const modalInstance =
      bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
    modalInstance.show();

    return modalInstance;
  },

  /**
   * Create a confirmation modal
   * @param {Object} options - Configuration options
   * @returns {Promise} - Resolves with true if confirmed, false if canceled
   */
  confirm(options = {}) {
    return new Promise((resolve) => {
      const id = "confirm-modal-" + Date.now();

      // Create modal element
      const modal = document.createElement("div");
      modal.id = id;
      modal.className = "modal fade";
      modal.tabIndex = -1;
      modal.role = "dialog";
      modal.setAttribute("aria-hidden", "true");

      // Create modal content
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${options.title || "Confirmation"}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>${options.message || "Are you sure you want to proceed?"}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                ${options.cancelText || "Cancel"}
              </button>
              <button type="button" class="btn btn-primary confirm-btn">
                ${options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      `;

      // Add to document
      document.body.appendChild(modal);

      // Initialize modal
      const modalInstance = new bootstrap.Modal(modal);

      // Setup event handlers
      modal.querySelector(".confirm-btn").addEventListener("click", () => {
        modalInstance.hide();
        resolve(true);
      });

      modal.addEventListener("hidden.bs.modal", () => {
        document.body.removeChild(modal);
        if (!modal.confirmed) {
          resolve(false);
        }
      });

      // Show the modal
      modalInstance.show();
    });
  },
};

// Export for global use
window.ModalHelpers = ModalHelpers;
