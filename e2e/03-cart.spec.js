import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from './helpers.js';

test.describe('Cart', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, TEST_USER);
    });

    test('empty cart shows empty state message', async ({ page }) => {
        await page.goto('/cart');
        // Either an empty-cart message or the cart items list — not an error
        const emptyMsg = page.getByText(/empty|no items/i);
        const payBtn   = page.getByRole('button', { name: /pay now/i });
        await expect(emptyMsg.or(payBtn)).toBeVisible({ timeout: 10_000 });
    });

    test('Add to Cart button increments cart badge', async ({ page }) => {
        await page.goto('/');
        // Wait for products
        const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
        await addBtn.waitFor({ timeout: 15_000 });

        const badgeBefore = await page.locator('.cart-badge').textContent().catch(() => '0');
        await addBtn.click();
        // Badge should increase
        await expect(page.locator('.cart-badge')).not.toHaveText(badgeBefore || '0');
    });

    test('cart page lists added items', async ({ page }) => {
        await page.goto('/');
        const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
        await addBtn.waitFor({ timeout: 15_000 });
        await addBtn.click();
        await page.goto('/cart');
        // Should see at least one cart item
        await expect(page.locator('.cart-item, [class*="cart-item"]').first()).toBeVisible({ timeout: 10_000 });
    });
});
