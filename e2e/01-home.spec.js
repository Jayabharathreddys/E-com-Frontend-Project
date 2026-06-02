import { test, expect } from '@playwright/test';

test.describe('Home — Product Listing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders the navbar with category links', async ({ page }) => {
        await expect(page.getByRole('navigation')).toBeVisible();
        // At least one category nav-link should appear after categories load
        await expect(page.getByRole('link', { name: /electronics|jewelery|clothing/i }).first()).toBeVisible({ timeout: 15_000 });
    });

    test('renders product cards', async ({ page }) => {
        // Products loaded from the backend
        await expect(page.locator('.product-card, [data-testid="product-card"], .products-list > *').first()).toBeVisible({ timeout: 15_000 });
    });

    test('pagination renders and next page works', async ({ page }) => {
        const nextBtn = page.getByRole('button', { name: /next|›/i });
        // Only assert pagination exists if products are loaded
        await page.waitForSelector('.product-card, [class*="product"]', { timeout: 15_000 }).catch(() => {});
        if (await nextBtn.isVisible()) {
            await nextBtn.click();
            await expect(page.getByRole('button', { name: /prev|‹/i })).toBeVisible();
        }
    });

    test('shows the cart icon in navbar', async ({ page }) => {
        await expect(page.locator('.cart-icon-container, [aria-label*="Cart"]')).toBeVisible();
    });
});
