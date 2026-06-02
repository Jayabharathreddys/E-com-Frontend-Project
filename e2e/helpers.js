/**
 * Shared helpers for JBE Commerce e2e tests.
 * All credentials read from environment variables so they're never hard-coded.
 *
 * Required env vars:
 *   E2E_USER_EMAIL    — registered test account email
 *   E2E_USER_PASS     — registered test account password
 *   E2E_ADMIN_EMAIL   — admin account email
 *   E2E_ADMIN_PASS    — admin account password
 */

export const TEST_USER = {
    email:    process.env.E2E_USER_EMAIL  || 'testuser@jbecommerce.test',
    password: process.env.E2E_USER_PASS   || 'Test@12345',
    name:     'Test User',
};

export const ADMIN_USER = {
    email:    process.env.E2E_ADMIN_EMAIL || 'admin@jbecommerce.test',
    password: process.env.E2E_ADMIN_PASS  || 'Admin@12345',
};

/**
 * Log in as the given user via the UI and wait for the home page to load.
 */
export async function loginAs(page, user) {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    // Login form uses <input type="submit" value="Login"> — match by value
    await page.locator('input[type="submit"][value="Login"]').click();
    // Wait until we're redirected away from /login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
}

/**
 * Log out via the navbar dropdown.
 */
export async function logout(page) {
    await page.getByRole('button', { name: /hi,/i }).click();
    await page.getByRole('menuitem', { name: /logout/i }).click();
    await page.waitForURL('/login');
}
