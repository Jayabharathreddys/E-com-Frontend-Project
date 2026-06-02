import { test, expect } from '@playwright/test';

test.describe('Error Pages', () => {
    test('404 page appears for unknown route', async ({ page }) => {
        await page.goto('/this-route-definitely-does-not-exist');
        await expect(page.getByText(/404|page not found/i)).toBeVisible();
        await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
    });

    test('/unauthorized page renders correctly', async ({ page }) => {
        await page.goto('/unauthorized');
        await expect(page.getByText(/401|unauthorized/i)).toBeVisible();
    });
});
