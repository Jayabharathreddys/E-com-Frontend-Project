import { test, expect } from '@playwright/test';

test.describe('Forgot Password', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/forgot-password');
    });

    test('page renders correctly', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /forgot|reset/i })).toBeVisible();
    });

    test('shows validation error for empty email', async ({ page }) => {
        await page.getByRole('button', { name: /send|submit|otp/i }).click();
        await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test('shows error for unknown email', async ({ page }) => {
        await page.getByLabel(/email/i).fill('nobody@nowherejbe.com');
        await page.getByRole('button', { name: /send|submit|otp/i }).click();
        await expect(page.getByText(/not found|no user/i)).toBeVisible({ timeout: 10_000 });
    });
});
