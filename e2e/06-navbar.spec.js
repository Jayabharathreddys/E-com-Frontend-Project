import { test, expect } from '@playwright/test';
import { loginAs, logout, TEST_USER } from './helpers.js';

test.describe('Navbar', () => {
    test('shows Login link when not authenticated', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    });

    test('shows greeting and dropdown when logged in', async ({ page }) => {
        await loginAs(page, TEST_USER);
        const greetingBtn = page.getByRole('button', { name: /hi,/i });
        await expect(greetingBtn).toBeVisible();
    });

    test('dropdown contains expected items', async ({ page }) => {
        await loginAs(page, TEST_USER);
        await page.getByRole('button', { name: /hi,/i }).click();
        await expect(page.getByRole('menuitem', { name: /my orders/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /wishlist/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /logout/i })).toBeVisible();
    });

    test('My Orders nav link navigates to /orders', async ({ page }) => {
        await loginAs(page, TEST_USER);
        await page.getByRole('button', { name: /hi,/i }).click();
        await page.getByRole('menuitem', { name: /my orders/i }).click();
        await expect(page).toHaveURL('/orders');
    });

    test('Escape key closes the dropdown', async ({ page }) => {
        await loginAs(page, TEST_USER);
        await page.getByRole('button', { name: /hi,/i }).click();
        await expect(page.getByRole('menu')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).not.toBeVisible();
    });

    test('Cart link navigates to /cart', async ({ page }) => {
        await loginAs(page, TEST_USER);
        await page.locator('.cart-icon-container, [aria-label*="Cart"]').click();
        await expect(page).toHaveURL('/cart');
    });
});
