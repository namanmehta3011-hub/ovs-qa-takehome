import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Assignment Submission — Scenario A
 *
 * No live system is available, so this suite is written against a realistic
 * assumed page structure for the LMS. Assumptions are noted inline:
 * - Page: /assignments/:id/submit
 * - File input: [data-testid="submission-file-input"]
 * - Submit button: [data-testid="submit-assignment-btn"]
 * - Success state: visible text "Submission received"
 * - Error state: an element with role="alert" containing the validation message
 * - Auth is assumed to be handled globally via a Playwright storageState fixture
 * - Fixture files (sample-valid.pdf, sample-oversized.pdf, sample-invalid.exe,
 *   sample-valid-2.docx) live in ./fixtures
 */

test.describe('Assignment Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assignments/1234/submit');
  });

  test('happy path: uploads a valid PDF under the size limit', async ({ page }) => {
    const filePath = path.join(__dirname, 'fixtures', 'sample-valid.pdf');

    await page.setInputFiles('[data-testid="submission-file-input"]', filePath);
    await page.click('[data-testid="submit-assignment-btn"]');

    await expect(page.getByText('Submission received')).toBeVisible();
    await expect(page.getByTestId('submission-filename')).toHaveText('sample-valid.pdf');
  });

  test('edge case: rejects a file exceeding the 10MB limit', async ({ page }) => {
    const filePath = path.join(__dirname, 'fixtures', 'sample-oversized.pdf'); // fixture >10MB

    await page.setInputFiles('[data-testid="submission-file-input"]', filePath);
    await page.click('[data-testid="submit-assignment-btn"]');

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/file size/i);
    await expect(page.getByText('Submission received')).not.toBeVisible();
  });

  test('failure case: rejects an unsupported file type', async ({ page }) => {
    const filePath = path.join(__dirname, 'fixtures', 'sample-invalid.exe');

    await page.setInputFiles('[data-testid="submission-file-input"]', filePath);
    await page.click('[data-testid="submit-assignment-btn"]');

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/file type|unsupported/i);
  });

  test('resubmission replaces the previous file', async ({ page }) => {
    const firstFile = path.join(__dirname, 'fixtures', 'sample-valid.pdf');
    const secondFile = path.join(__dirname, 'fixtures', 'sample-valid-2.docx');

    await page.setInputFiles('[data-testid="submission-file-input"]', firstFile);
    await page.click('[data-testid="submit-assignment-btn"]');
    await expect(page.getByText('Submission received')).toBeVisible();

    // Resubmit with a different file — should replace, not duplicate
    await page.setInputFiles('[data-testid="submission-file-input"]', secondFile);
    await page.click('[data-testid="submit-assignment-btn"]');

    await expect(page.getByText('Submission received')).toBeVisible();
    await expect(page.getByTestId('submission-filename')).toHaveText('sample-valid-2.docx');
    await expect(page.getByTestId('submission-history-item')).toHaveCount(1);
  });
});
