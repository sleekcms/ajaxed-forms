# Testing Strategy

This document outlines the comprehensive testing strategy for the SleekCMS AJAX Forms library.

## Test Framework

- **Jest**: JavaScript testing framework
- **JSDOM**: Simulates browser environment for DOM manipulation testing
- **@testing-library/dom**: Utilities for DOM testing

## Test Coverage

### 1. Form Detection and Initialization (4 tests)
- ✅ Attaches handler to forms with `data-sleekcms` attribute
- ✅ Ignores forms without `data-sleekcms` attribute
- ✅ Prevents double-attachment of handlers
- ✅ Creates message box element with correct styling

### 2. Dynamic Form Detection (2 tests)
- ✅ Detects forms added to DOM after page load
- ✅ Detects nested forms added dynamically via MutationObserver

### 3. Form Submission with Action URLs (4 tests)
- ✅ Submits with `action` attribute
- ✅ Submits with `data-action` attribute
- ✅ Constructs SleekCMS URL from `data-sleekcms` attribute
- ✅ Shows error when no valid action URL is provided

### 4. Successful Form Submission (4 tests)
- ✅ Displays success message from JSON response
- ✅ Shows default success message when none provided
- ✅ Resets form fields on successful submission
- ✅ Handles plain text responses

### 5. Failed Form Submission (3 tests)
- ✅ Displays error message from server
- ✅ Shows default error message when none provided
- ✅ Preserves form data on failed submission

### 6. Network Errors (1 test)
- ✅ Handles network failures gracefully with user-friendly message

### 7. UI Feedback (2 tests)
- ✅ Shows "Submitting..." message during async operation
- ✅ Prevents default form submission behavior

### 8. Edge Cases (4 tests)
- ✅ Gracefully degrades when Fetch API is unavailable
- ✅ Supports custom HTTP methods
- ✅ Handles multiple forms on same page
- ✅ Handles empty response bodies

## Coverage Metrics

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
index.js  |     100 |    94.44 |     100 |     100
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Continuous Integration

Tests run automatically on:
- Every push to `main` branch
- Every pull request
- Tested on Node.js versions: 18.x, 20.x, 22.x

## What This Ensures

✅ **No breaking changes**: Tests catch regressions before deployment  
✅ **Cross-browser compatibility**: JSDOM simulates real browser behavior  
✅ **Error handling**: All error paths are tested  
✅ **User experience**: UI feedback is validated  
✅ **Edge cases**: Unusual scenarios are covered  
✅ **Future maintenance**: Easy to add new tests as features grow  

## Test Philosophy

- **Comprehensive**: Cover all code paths and user scenarios
- **Isolated**: Each test is independent with proper setup/teardown
- **Fast**: Mocked fetch API for speed
- **Maintainable**: Clear test names and organization
- **Realistic**: Simulates actual user interactions
