import { test, expect } from '@playwright/test';

test.describe('Error Pages', () => {
    test('404 page appears for unknown route', async ({ page }) => {
        await page.goto('/this-route-definitely-does-not-exist');
        await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
        await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
    });

    test('/unauthorized page renders correctly', async ({ page }) => {
        await page.goto('/unauthorized');
        await expect(page.getByRole('heading', { name: '403' })).toBeVisible();
    });
});
