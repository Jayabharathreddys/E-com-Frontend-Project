import { test, expect } from '@playwright/test';
import { loginAs, logout, TEST_USER } from './helpers.js';

test.describe('Authentication', () => {
    test('shows validation errors on empty login submit', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await expect(page.getByText(/email is required/i)).toBeVisible();
        await expect(page.getByText(/password is required/i)).toBeVisible();
    });

    test('shows error for wrong credentials', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('nobody@nowhere.com');
        await page.getByLabel(/password/i).fill('wrongpassword1');
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await expect(page.getByText(/incorrect|not found|invalid/i)).toBeVisible({ timeout: 10_000 });
    });

    test('successful login redirects to home', async ({ page }) => {
        await loginAs(page, TEST_USER);
        await expect(page).toHaveURL('/');
        // Navbar shows greeting
        await expect(page.getByText(/hi,/i)).toBeVisible();
    });

    test('logout clears session and redirects to login', async ({ page }) => {
        await loginAs(page, TEST_USER);
        await logout(page);
        await expect(page).toHaveURL('/login');
        await expect(page.getByText(/hi,/i)).not.toBeVisible();
    });

    test('signup page shows all fields', async ({ page }) => {
        await page.goto('/signup');
        await expect(page.getByLabel(/name/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/^password/i)).toBeVisible();
        await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    });

    test('signup validation — mismatched passwords', async ({ page }) => {
        await page.goto('/signup');
        await page.getByLabel(/name/i).fill('Test Name');
        await page.getByLabel(/email/i).fill('new@test.com');
        await page.getByLabel(/^password/i).fill('pass1234');
        await page.getByLabel(/confirm password/i).fill('pass5678');
        await page.getByRole('button', { name: /sign up|register|create/i }).click();
        await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('protected route redirects unauthenticated user to login', async ({ page }) => {
        await page.goto('/cart');
        await expect(page).toHaveURL(/\/login/);
    });
});
