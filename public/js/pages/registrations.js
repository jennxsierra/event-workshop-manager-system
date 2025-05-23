/**
 * Registration page specific JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeRegistrationPage();
});

/**
 * Initialize functionality specific to the registration pages
 */
function initializeRegistrationPage() {
  setupCancellationConfirmations();
}

/**
 * Setup confirmation modals for registration cancellation
 */
function setupCancellationConfirmations() {
  // Find all registration cancellation elements
  const cancelButtons = document.querySelectorAll('[data-cancel-registration]');
  
  cancelButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Get registration details
      const eventName = button.getAttribute('data-event-name') || 'this event';
      const cancelUrl = button.getAttribute('data-cancel-url');
      
      if (!cancelUrl) return;
      
      // Use the ModalHelpers to show a confirmation dialog
      if (window.ModalHelpers) {
        const confirmed = await ModalHelpers.confirm({
          title: 'Cancel Registration',
          message: `Are you sure you want to cancel your registration for ${eventName}?`,
          confirmText: 'Yes, Cancel Registration',
          cancelText: 'No, Keep Registration'
        });
        
        if (confirmed) {
          // Create and submit a form to cancel the registration
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = cancelUrl;
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        // Fallback to standard confirm dialog
        if (confirm(`Are you sure you want to cancel your registration for ${eventName}?`)) {
          window.location.href = cancelUrl;
        }
      }
    });
  });
}
