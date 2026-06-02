import { test, expect } from '@playwright/test';
import { loginAs, logout, ADMIN_USER, TEST_USER } from './helpers.js';

test.describe('Admin Panel', () => {
    test('non-admin user is redirected to /unauthorized', async ({ page }) => {
        await loginAs(page, TEST_USER);
        await page.goto('/admin');
        await expect(page).toHaveURL('/unauthorized');
    });

    test.describe('as admin', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, ADMIN_USER);
        });

        test('admin dashboard loads with stat cards', async ({ page }) => {
            await page.goto('/admin');
            await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
            await expect(page.getByText(/total orders/i)).toBeVisible({ timeout: 15_000 });
        });

        test('admin nav shows all 4 sections', async ({ page }) => {
            await page.goto('/admin');
            await expect(page.getByRole('link', { name: /orders/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /products/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /users/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /reviews/i })).toBeVisible();
        });

        test('admin orders page loads with table', async ({ page }) => {
            await page.goto('/admin/orders');
            await expect(page.getByRole('heading', { name: /all orders/i })).toBeVisible();
            // Table header should be present
            await expect(page.getByRole('columnheader', { name: /order id/i })).toBeVisible({ timeout: 15_000 });
        });

        test('admin products page shows Add Product button', async ({ page }) => {
            await page.goto('/admin/products');
            await expect(page.getByRole('button', { name: /add product/i })).toBeVisible();
        });

        test('admin products add modal opens and closes', async ({ page }) => {
            await page.goto('/admin/products');
            await page.getByRole('button', { name: /add product/i }).click();
            // Assert the modal card is visible (not the persistent page button)
            await expect(page.locator('.modal-card')).toBeVisible();
            await expect(page.getByRole('heading', { name: /add product/i, level: 2 })).toBeVisible();
            await page.getByRole('button', { name: /cancel/i }).click();
            // Modal card should be gone after cancel
            await expect(page.locator('.modal-card')).not.toBeVisible();
        });

        test('admin users page shows role dropdowns', async ({ page }) => {
            await page.goto('/admin/users');
            await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
            // Role select should appear after load
            await expect(page.locator('.role-select').first()).toBeVisible({ timeout: 15_000 });
        });

        test('admin reviews page loads', async ({ page }) => {
            await page.goto('/admin/reviews');
            await expect(page.getByRole('heading', { name: /reviews/i })).toBeVisible();
        });

        test('admin panel link appears in navbar dropdown', async ({ page }) => {
            await page.goto('/');
            await page.getByRole('button', { name: /hi,/i }).click();
            await expect(page.getByRole('menuitem', { name: /admin panel/i })).toBeVisible();
        });
    });
});
