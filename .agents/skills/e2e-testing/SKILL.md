---
name: e2e-testing
description: Runbook and patterns for end-to-end testing, browser automation, client-side download verification (PDF, DOCX, Images), and wizard flow validation using Playwright or Vitest.
---

# End-to-End & Integration Testing Guide

## Core Principles
1. **Test User Journeys, Not Implementation**: Focus tests on complete user flows (e.g., wizard input -> preview render -> file download -> quota update).
2. **Deterministic Verification of Client-Side Downloads**: Intercept and validate generated blobs, byte sizes, and file headers for PDF/DOCX exports.
3. **Resilient Selectors**: Use user-facing accessible locators (`getByRole`, `getByLabel`, `getByText`) over brittle CSS class selectors.

---

## 1. Flow Testing Patterns

### A. Testing Multi-Step Wizards (e.g., CV Builder / Document Generator)
```typescript
import { test, expect } from '@playwright/test';

test('completes CV wizard and triggers PDF export', async ({ page }) => {
  await page.goto('/tools/cv-builder');

  // Wizard Step 1: Role & Experience
  await page.getByRole('button', { name: /start wizard/i }).click();
  await page.getByLabel(/job title/i).fill('Senior Frontend Engineer');
  await page.getByRole('button', { name: /next/i }).click();

  // Wizard Step 2: Details & Bullets
  await page.getByLabel(/full name/i).fill('Jane Doe');
  await page.getByLabel(/summary/i).fill('Experienced React & TypeScript engineer.');
  await page.getByRole('button', { name: /generate cv/i }).click();

  // Verify preview is rendered
  await expect(page.locator('#cv-preview-container')).toBeVisible();

  // Validate download event
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export pdf/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});
```

### B. Testing Client-Side File Upload & OCR/Conversion
```typescript
test('uploads image and extracts OCR text', async ({ page }) => {
  await page.goto('/tools/ocr');

  // Set file input
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample_receipt.png');

  // Verify processing state appears then finishes
  await expect(page.getByText(/processing ocr/i)).toBeVisible();
  await expect(page.getByRole('textbox', { name: /extracted text/i })).not.toBeEmpty({ timeout: 15000 });
});
```

---

## 2. Mocking External Services & APIs

### A. Midtrans Payment Webhook / Snap UI
- Mock the Midtrans popup or checkout redirect endpoint using Playwright route interception:
```typescript
await page.route('**/api/payment/create-transaction', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ token: 'mock-snap-token-123', redirect_url: 'https://app.sandbox.midtrans.com/...' })
  });
});
```

### B. AI Endpoints (Groq / Gemini Suggestions)
- Mock LLM rewrite endpoints in test environments to ensure zero flakiness and instant test execution:
```typescript
await page.route('**/api/ai/suggest', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ suggestions: ['Engineered scalable micro-frontends with 99.9% uptime.'] })
  });
});
```

---

## 3. Visual Regression Guidelines
- Set fixed viewport sizes (`1280x800` for desktop, `375x667` for mobile).
- Disable CSS animations/transitions via Playwright's `animations: 'disabled'` option before taking snapshots.
- Mask dynamic elements like random IDs, dates, or live preview timestamps.

---

## 4. Test Execution Runbook
- Run test flows locally: `npm run test:flows`
- Run Playwright E2E suite: `npx playwright test`
- Run headed for debugging: `npx playwright test --headed`
- Update visual baselines: `npx playwright test --update-snapshots`
