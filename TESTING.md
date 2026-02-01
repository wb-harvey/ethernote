# Playwright Testing for Ethernote

This document explains how to run end-to-end tests for the Ethernote web app using Playwright.

## Prerequisites

- Node.js and npm installed
- Playwright installed (already set up in this project)

## Running Tests

### Run all tests (headless mode)
```bash
npm test
```

### Run tests with browser UI visible
```bash
npm run test:headed
```

### Run tests in interactive UI mode
```bash
npm run test:ui
```

### View test report
```bash
npm run test:report
```

### Run tests for specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run specific test file
```bash
npx playwright test e2e/ethernote.spec.js
```

## Test Files

Tests are located in the `e2e/` directory:
- `e2e/ethernote.spec.js` - Main test suite for Ethernote app

## Configuration

The Playwright configuration is in `playwright.config.js`. It includes:
- Automatic dev server startup
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- Screenshot on failure
- Trace collection on retry

## Writing New Tests

Create new test files in the `e2e/` directory with the `.spec.js` extension:

```javascript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  // Your test code here
});
```

## Debugging Tests

1. Run in headed mode: `npm run test:headed`
2. Use the Playwright Inspector: `npx playwright test --debug`
3. View traces in the HTML report: `npm run test:report`

## CI/CD Integration

The configuration is already set up for CI environments with:
- Automatic retries (2 retries on CI)
- Single worker on CI
- No server reuse on CI

Simply run `npm test` in your CI pipeline.
