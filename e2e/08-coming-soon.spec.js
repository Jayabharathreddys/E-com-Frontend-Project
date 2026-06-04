import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from './helpers.js';

const COMING_SOON_ROUTES = ['/wishlist', '/dashboard', '/addresses', '/profile'];

test.describe('Coming Soon pages', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, TEST_USER);
    });

    for (const route of COMING_SOON_ROUTES) {
        test(`${route} shows a coming-soon page (not a 404)`, async ({ page }) => {
            await page.goto(route);
            // Should NOT show the 404 error page
            await expect(page.getByText(/page not found/i)).not.toBeVisible();
            // Should show a coming-soon indicator
            await expect(page.getByText(/coming soon|under development|version 2/i).first()).toBeVisible({ timeout: 10_000 });
        });
    }

    test('/wishlist coming-soon page has a Continue Shopping link', async ({ page }) => {
        await page.goto('/wishlist');
        await expect(page.getByRole('link', { name: /continue shopping/i })).toBeVisible();
    });
});
