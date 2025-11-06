# ajaxed-forms

Converts any static web form with `data-sleekcms="true"` attribute to AJAX enabled form with status and error messages.

## Installation

### NPM
```bash
npm install ajaxed-forms
```

### Direct Download
Download `ajaxed-forms.js` and include it in your HTML:

```html
<script src="ajaxed-forms.js"></script>
```

## Usage

Simply add the `data-sleekcms="true"` attribute to any form you want to convert to AJAX:

```html
<form action="/submit" method="POST" data-sleekcms="true">
    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <button type="submit">Submit</button>
</form>

<script src="ajaxed-forms.js"></script>
```

That's it! The form will now:
- Submit via AJAX instead of causing a page reload
- Show a loading message while submitting
- Display success or error messages automatically
- Reset the form on successful submission
- Disable the submit button during submission

## Features

- ✅ Zero configuration required
- ✅ Automatic AJAX conversion for forms with `data-sleekcms="true"`
- ✅ Built-in status messages (loading, success, error)
- ✅ Automatic form reset on success
- ✅ Submit button state management
- ✅ Custom event dispatching for advanced integration
- ✅ Support for dynamically added forms
- ✅ No dependencies

## Custom Events

The library dispatches custom events you can listen to:

```javascript
// Success event
document.addEventListener('sleekcms:success', function(event) {
    console.log('Form submitted!', event.detail.response);
});

// Error event
document.addEventListener('sleekcms:error', function(event) {
    console.log('Submission failed!', event.detail.error);
});
```

## Styling

Status messages are automatically styled with appropriate colors:
- **Loading**: Blue background
- **Success**: Green background
- **Error**: Red background

You can customize the appearance by targeting these CSS classes:
- `.sleekcms-status` - The status container
- `.sleekcms-loading` - Loading state
- `.sleekcms-success` - Success state
- `.sleekcms-error` - Error state

```css
.sleekcms-status {
    /* Your custom styles */
}
```

## API

### Manual Initialization

If you need to manually initialize forms (e.g., after dynamically adding forms):

```javascript
AjaxedForms.init();
```

## Browser Support

Works in all modern browsers that support:
- XMLHttpRequest
- FormData
- CustomEvent
- ES5

## Example

See `example.html` for a complete working example.

## License

ISC
