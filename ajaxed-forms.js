/**
 * AjaxedForms - Converts static HTML forms to AJAX-enabled forms
 * 
 * Usage: Include this script in your HTML page. All forms with data-sleekcms="true"
 * will automatically be converted to AJAX forms with status and error messages.
 */

(function() {
  'use strict';

  /**
   * Initialize AJAX forms when DOM is ready
   */
  function initAjaxedForms() {
    // Find all forms with data-sleekcms="true"
    const forms = document.querySelectorAll('form[data-sleekcms="true"]');
    
    forms.forEach(function(form) {
      setupAjaxForm(form);
    });
  }

  /**
   * Setup a single form for AJAX submission
   * @param {HTMLFormElement} form - The form element to enhance
   */
  function setupAjaxForm(form) {
    // Create status message container if it doesn't exist
    let statusContainer = form.querySelector('.sleekcms-status');
    if (!statusContainer) {
      statusContainer = document.createElement('div');
      statusContainer.className = 'sleekcms-status';
      statusContainer.style.display = 'none';
      statusContainer.style.padding = '10px';
      statusContainer.style.marginTop = '10px';
      statusContainer.style.borderRadius = '4px';
      form.appendChild(statusContainer);
    }

    // Add submit event listener
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      handleFormSubmit(form, statusContainer);
    });
  }

  /**
   * Handle form submission via AJAX
   * @param {HTMLFormElement} form - The form being submitted
   * @param {HTMLElement} statusContainer - The status message container
   */
  function handleFormSubmit(form, statusContainer) {
    // Get form data
    const formData = new FormData(form);
    const method = form.method || 'POST';
    const action = form.action || window.location.href;

    // Get submit button and disable it
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent || submitButton.value : '';
    
    if (submitButton) {
      submitButton.disabled = true;
      if (submitButton.tagName === 'BUTTON') {
        submitButton.textContent = 'Submitting...';
      } else {
        submitButton.value = 'Submitting...';
      }
    }

    // Show loading status
    showStatus(statusContainer, 'Submitting form...', 'loading');

    // Create and send XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open(method.toUpperCase(), action, true);

    // Handle response
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Success
        handleSuccess(form, statusContainer, xhr.responseText);
      } else {
        // Error
        handleError(form, statusContainer, 'Server error: ' + xhr.status);
      }
      
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        if (submitButton.tagName === 'BUTTON') {
          submitButton.textContent = originalButtonText;
        } else {
          submitButton.value = originalButtonText;
        }
      }
    };

    xhr.onerror = function() {
      handleError(form, statusContainer, 'Network error occurred. Please try again.');
      
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        if (submitButton.tagName === 'BUTTON') {
          submitButton.textContent = originalButtonText;
        } else {
          submitButton.value = originalButtonText;
        }
      }
    };

    // Send the form data
    xhr.send(formData);
  }

  /**
   * Handle successful form submission
   * @param {HTMLFormElement} form - The form that was submitted
   * @param {HTMLElement} statusContainer - The status message container
   * @param {string} response - The server response
   */
  function handleSuccess(form, statusContainer, response) {
    showStatus(statusContainer, 'Form submitted successfully!', 'success');
    
    // Reset the form
    form.reset();

    // Dispatch custom event for success on document
    const event = new CustomEvent('sleekcms:success', {
      detail: { response: response, form: form }
    });
    document.dispatchEvent(event);

    // Auto-hide success message after 5 seconds
    setTimeout(function() {
      hideStatus(statusContainer);
    }, 5000);
  }

  /**
   * Handle form submission error
   * @param {HTMLFormElement} form - The form that was submitted
   * @param {HTMLElement} statusContainer - The status message container
   * @param {string} errorMessage - The error message to display
   */
  function handleError(form, statusContainer, errorMessage) {
    showStatus(statusContainer, errorMessage, 'error');

    // Dispatch custom event for error on document
    const event = new CustomEvent('sleekcms:error', {
      detail: { error: errorMessage, form: form }
    });
    document.dispatchEvent(event);
  }

  /**
   * Show status message
   * @param {HTMLElement} container - The status message container
   * @param {string} message - The message to display
   * @param {string} type - The type of message: 'loading', 'success', or 'error'
   */
  function showStatus(container, message, type) {
    container.textContent = message;
    container.style.display = 'block';
    
    // Reset all type classes
    container.classList.remove('sleekcms-loading', 'sleekcms-success', 'sleekcms-error');
    
    // Add appropriate class
    container.classList.add('sleekcms-' + type);

    // Set appropriate colors
    if (type === 'success') {
      container.style.backgroundColor = '#d4edda';
      container.style.color = '#155724';
      container.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
      container.style.backgroundColor = '#f8d7da';
      container.style.color = '#721c24';
      container.style.border = '1px solid #f5c6cb';
    } else if (type === 'loading') {
      container.style.backgroundColor = '#d1ecf1';
      container.style.color = '#0c5460';
      container.style.border = '1px solid #bee5eb';
    }
  }

  /**
   * Hide status message
   * @param {HTMLElement} container - The status message container
   */
  function hideStatus(container) {
    container.style.display = 'none';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAjaxedForms);
  } else {
    // DOM is already ready
    initAjaxedForms();
  }

  // Also watch for dynamically added forms
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'FORM' && node.getAttribute('data-sleekcms') === 'true') {
              setupAjaxForm(node);
            }
            // Also check children
            if (node.querySelectorAll) {
              const forms = node.querySelectorAll('form[data-sleekcms="true"]');
              forms.forEach(setupAjaxForm);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Expose reinit function for manual initialization
  window.AjaxedForms = {
    init: initAjaxedForms
  };
})();
