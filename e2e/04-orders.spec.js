import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from './helpers.js';

test.describe('My Orders', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, TEST_USER);
        await page.goto('/orders');
    });

    test('renders My Orders heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
    });

    test('shows all 4 status tabs', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /all orders/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /confirmed/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /pending/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /failed/i })).toBeVisible();
    });

    test('shows account sidebar', async ({ page }) => {
        await expect(page.getByText(/my account/i)).toBeVisible();
    });

    test('search input is visible', async ({ page }) => {
        await expect(page.getByRole('searchbox')).toBeVisible();
    });

    test('clicking Confirmed tab updates active state', async ({ page }) => {
        const confirmedTab = page.getByRole('tab', { name: /confirmed/i });
        await confirmedTab.click();
        await expect(confirmedTab).toHaveAttribute('aria-selected', 'true');
    });

    test('empty state shows Browse Products link', async ({ page }) => {
        // If there are no orders, empty state should be shown
        const browseLink = page.getByText(/browse products/i);
        const orderCard  = page.locator('.order-card').first();
        await expect(browseLink.or(orderCard)).toBeVisible({ timeout: 10_000 });
    });
});
