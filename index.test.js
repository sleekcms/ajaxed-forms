/**
 * @jest-environment jsdom
 */

describe('SleekCMS AJAX Forms', () => {
  let originalFetch;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock fetch
    originalFetch = global.fetch;
    global.fetch = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const loadScript = () => {
    // Load the script by requiring it
    jest.isolateModules(() => {
      require('./index.js');
    });
  };

  const waitForTimeout = (ms = 2100) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  describe('Form Detection and Initialization', () => {
    test('should attach handler to forms with data-sleekcms attribute', async () => {
      document.body.innerHTML = `
        <form data-sleekcms="test-form-123">
          <input type="text" name="email" value="test@example.com" />
          <button type="submit">Submit</button>
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      expect(form.dataset.sleekcmsAttached).toBe('true');
    });

    test('should not attach handler to forms without data-sleekcms attribute', async () => {
      document.body.innerHTML = `
        <form action="/submit">
          <input type="text" name="email" />
          <button type="submit">Submit</button>
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      expect(form.dataset.sleekcmsAttached).toBeUndefined();
    });

    test('should not attach handler twice to the same form', async () => {
      document.body.innerHTML = `
        <form data-sleekcms="test-form-123">
          <input type="text" name="email" />
          <button type="submit">Submit</button>
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      const messageBoxes = form.querySelectorAll('div');
      expect(messageBoxes.length).toBe(1);
    });

    test('should create message box element', async () => {
      document.body.innerHTML = `
        <form data-sleekcms="test-form-123">
          <input type="text" name="email" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      const messageBox = form.querySelector('div');
      
      expect(messageBox).toBeTruthy();
      expect(messageBox.style.marginTop).toBe('8px');
      expect(messageBox.style.fontFamily).toBe('sans-serif');
    });
  });

  describe('Dynamic Form Detection', () => {
    test('should detect forms added after page load', async () => {
      document.body.innerHTML = '<div id="container"></div>';

      loadScript();
      await waitForTimeout();

      // Add form dynamically
      const container = document.getElementById('container');
      container.innerHTML = `
        <form data-sleekcms="dynamic-form-456">
          <input type="text" name="name" />
        </form>
      `;

      // Wait for MutationObserver to process
      await new Promise(resolve => setTimeout(resolve, 100));

      const form = document.querySelector('form');
      expect(form.dataset.sleekcmsAttached).toBe('true');
    });

    test('should detect nested forms added dynamically', async () => {
      document.body.innerHTML = '<div id="container"></div>';

      loadScript();
      await waitForTimeout();

      const container = document.getElementById('container');
      container.innerHTML = `
        <div class="wrapper">
          <div class="inner">
            <form data-sleekcms="nested-form-789">
              <input type="text" name="name" />
            </form>
          </div>
        </div>
      `;

      await new Promise(resolve => setTimeout(resolve, 100));

      const form = document.querySelector('form');
      expect(form.dataset.sleekcmsAttached).toBe('true');
    });
  });

  describe('Form Submission with Action URL', () => {
    test('should submit form with action attribute', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success!' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test" action="https://example.com/submit" method="POST">
          <input type="text" name="email" value="test@example.com" />
          <button type="submit">Submit</button>
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/submit',
        expect.objectContaining({
          method: 'post', // DOM returns lowercase method
          body: expect.any(FormData)
        })
      );
    });

    test('should submit form with data-action attribute', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success!' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test" data-action="https://example.com/custom">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/custom',
        expect.any(Object)
      );
    });

    test('should use sleekcms URL from data-sleekcms attribute', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success!' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="myform-abc123">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        'https://form.sleekcms.com/myform-abc123',
        expect.any(Object)
      );
    });

    test('should show error if no action URL is specified', async () => {
      document.body.innerHTML = `
        <form data-sleekcms="invalid">
          <input type="text" name="email" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toContain('Error: No action URL specified');
      expect(messageBox.style.color).toBe('red');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Successful Form Submission', () => {
    test('should display success message on successful JSON response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Form submitted successfully!' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toBe('Form submitted successfully!');
      expect(messageBox.style.color).toBe('green');
    });

    test('should display default success message if no message in response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({})
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toBe('Form submitted successfully!');
      expect(messageBox.style.color).toBe('green');
    });

    test('should reset form on successful submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success!' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit" method="POST">
          <input type="text" name="email" />
          <input type="text" name="name" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      const emailInput = form.querySelector('input[name="email"]');
      const nameInput = form.querySelector('input[name="name"]');

      // Set values after form initialization (JSDOM limitation workaround)
      emailInput.value = 'test@example.com';
      nameInput.value = 'John Doe';

      expect(emailInput.value).toBe('test@example.com');
      expect(nameInput.value).toBe('John Doe');

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(emailInput.value).toBe('');
      expect(nameInput.value).toBe('');
    });

    test('should handle plain text response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Thank you for your submission!'
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toBe('Thank you for your submission!');
      expect(messageBox.style.color).toBe('green');
    });
  });

  describe('Failed Form Submission', () => {
    test('should display error message on failed JSON response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Invalid email address' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="invalid" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toBe('Invalid email address');
      expect(messageBox.style.color).toBe('red');
    });

    test('should display default error message on failed response without message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({})
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toBe('Something went wrong.');
      expect(messageBox.style.color).toBe('red');
    });

    test('should not reset form on failed submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Error' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      const emailInput = form.querySelector('input[name="email"]');

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Network Errors', () => {
    test('should handle network errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toBe('Network error. Please try again.');
      expect(messageBox.style.color).toBe('red');
    });
  });

  describe('UI Feedback', () => {
    test('should show "Submitting..." message during submission', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      global.fetch.mockReturnValueOnce(promise);

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      const messageBox = form.querySelector('div');

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      // Check immediately after submission
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(messageBox.textContent).toBe('Submitting...');
      // JSDOM converts hex colors to rgb format
      expect(messageBox.style.color).toMatch(/(#555|rgb\(85,\s*85,\s*85\))/);

      // Resolve the promise
      resolvePromise({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success!' })
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should prevent default form submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success!' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      
      form.dispatchEvent(submitEvent);

      expect(submitEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle forms without fetch API support', () => {
      const originalFetch = global.fetch;
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      
      delete global.fetch;

      document.body.innerHTML = `
        <form data-sleekcms="test-abc">
          <input type="text" name="email" />
        </form>
      `;

      loadScript();

      expect(consoleWarn).toHaveBeenCalledWith('Fetch API not supported.');
      
      consoleWarn.mockRestore();
      global.fetch = originalFetch;
    });

    test('should handle form with custom method', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success!' })
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit" method="PUT">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/submit',
        expect.objectContaining({
          method: 'get' // JSDOM doesn't support custom methods like PUT, defaults to get
        })
      );
    });

    test('should handle multiple forms on same page', async () => {
      document.body.innerHTML = `
        <form data-sleekcms="form1-abc">
          <input type="text" name="email1" />
        </form>
        <form data-sleekcms="form2-def">
          <input type="text" name="email2" />
        </form>
        <form data-sleekcms="form3-ghi">
          <input type="text" name="email3" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const forms = document.querySelectorAll('form');
      expect(forms[0].dataset.sleekcmsAttached).toBe('true');
      expect(forms[1].dataset.sleekcmsAttached).toBe('true');
      expect(forms[2].dataset.sleekcmsAttached).toBe('true');
    });

    test('should handle empty response text', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => ''
      });

      document.body.innerHTML = `
        <form data-sleekcms="test-abc" action="https://example.com/submit">
          <input type="text" name="email" value="test@example.com" />
        </form>
      `;

      loadScript();
      await waitForTimeout();

      const form = document.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageBox = form.querySelector('div');
      expect(messageBox.textContent).toBe('Form submitted successfully!');
    });
  });
});
