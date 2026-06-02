import { test, expect } from '@playwright/test';

test.describe('Forgot Password', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/forgot-password');
    });

    test('page renders correctly', async ({ page }) => {
        // Forgot Password page uses a <p> tag, not a heading element
        await expect(page.getByText(/forgot password/i).first()).toBeVisible();
    });

    test('shows validation error for empty email', async ({ page }) => {
        await page.getByRole('button', { name: /send|submit|otp/i }).click();
        await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test('shows error for unknown email', async ({ page }) => {
        // Use a time-unique address on a reserved test domain so it can never exist
        const unknownEmail = `no-user-${Date.now()}@example.com`;
        await page.getByLabel(/email/i).fill(unknownEmail);
        await page.getByRole('button', { name: /send|submit|otp/i }).click();
        await expect(page.getByText(/not found|no user/i)).toBeVisible({ timeout: 10_000 });
    });
});
