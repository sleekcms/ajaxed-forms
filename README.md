# ajaxed-forms

[![CI Tests](https://github.com/sleekcms/ajaxed-forms/actions/workflows/ci.yml/badge.svg)](https://github.com/sleekcms/ajaxed-forms/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@sleekcms/ajaxed-forms.svg)](https://www.npmjs.com/package/@sleekcms/ajaxed-forms)

A lightweight JavaScript library that converts static HTML forms into AJAX-enabled forms. Built for SleekCMS but will work for any endpoint. Simply add a `data-sleekcms` attribute to your form and this script handles the rest.

## Features

- 🚀 Zero dependencies
- 📦 Tiny footprint (~2KB)
- 🔄 Automatic AJAX form submission
- 🎯 Dynamic form detection with MutationObserver
- ✅ Loading overlay with success/error message, dismissable to resubmit
- 🔒 Works with SleekCMS form endpoints
- 🧪 100% test coverage

## Installation

### Via CDN

Include the script in your HTML:

```html
<!-- unpkg -->
<script src="https://unpkg.com/@sleekcms/ajaxed-forms"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@sleekcms/ajaxed-forms"></script>
```

### Via npm

```bash
npm install @sleekcms/ajaxed-forms
```

Then import in your JavaScript:

```javascript
import '@sleekcms/ajaxed-forms';
```

## Usage

### Basic Usage

Add the `data-sleekcms` attribute to your form with your SleekCMS form ID:

```html
<form data-sleekcms="myform-abc123">
  <input type="text" name="name" placeholder="Your name" required />
  <input type="email" name="email" placeholder="Your email" required />
  <button type="submit">Submit</button>
</form>

<script src="https://unpkg.com/@sleekcms/ajaxed-forms"></script>
```

### Custom Action URL

You can specify a custom action URL using the `action` or `data-action` attribute:

```html
<form data-sleekcms="true" action="https://example.com/custom-endpoint">
  <input type="text" name="message" />
  <button type="submit">Send</button>
</form>
```

### SleekCMS Form ID Format

The `data-sleekcms` attribute accepts a form ID in the format `formname-uniqueid` (e.g., `contact-abc123`). The script automatically constructs the SleekCMS endpoint:

```
https://form.sleekcms.com/[your-form-id]
```

## How It Works

1. The script detects all forms with the `data-sleekcms` attribute
2. Automatically intercepts form submission and prevents default behavior
3. Shows a loading overlay with a spinner over the entire form area
4. Submits form data via AJAX using the Fetch API
5. Displays the submission status (success/error) in the overlay, keeping it open
6. The user closes the overlay (Close button) to submit again; submits are ignored while it's open
7. Resets the form on successful submission
8. Watches for dynamically added forms using MutationObserver

The overlay positions itself over the form, so the form is given `position: relative` automatically unless it already has a non-static position.

For forms that fit on screen the spinner/message panel is centered over the form. When the form is taller than the viewport (or scrolled out of view), the panel instead anchors to the center of the viewport as a floating card, so it stays visible while the user scrolls.

## Browser Support

- Modern browsers with Fetch API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Gracefully degrades in older browsers with a console warning

## Development

### Setup

```bash
npm install
```

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The library has comprehensive test coverage including:

- Form detection and initialization
- Dynamic form detection with MutationObserver
- Successful and failed form submissions
- Network error handling
- Multiple action URL configurations
- Edge cases and browser compatibility

Current coverage: **100% statements, 100% functions, 100% lines, 89.09% branches**

## API

### Form Attributes

- `data-sleekcms`: Required. Either a form ID (e.g., `contact-abc123`) or `"true"` when using custom action URLs
- `action` or `data-action`: Optional. Custom endpoint URL for form submission
- `method`: Optional. HTTP method (defaults to POST)

### Response Format

The script handles both JSON and plain text responses:

**JSON Response:**
```json
{
  "message": "Form submitted successfully!"
}
```

**Plain Text Response:**
```
Thank you for your submission!
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
