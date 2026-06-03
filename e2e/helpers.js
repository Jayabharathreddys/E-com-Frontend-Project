/**
 * Shared helpers for JBE Commerce e2e tests.
 *
 * Set credentials via environment variables (copy .env.e2e.example → .env.e2e):
 *   E2E_USER_EMAIL   — registered test account email
 *   E2E_USER_PASS    — registered test account password
 *   E2E_ADMIN_EMAIL  — admin account email
 *   E2E_ADMIN_PASS   — admin account password
 *
 * Run against production:
 *   BASE_URL=https://e-com-frontend-project-eta.vercel.app npx playwright test
 */

const missingVars = [];
if (!process.env.E2E_USER_EMAIL)  missingVars.push('E2E_USER_EMAIL');
if (!process.env.E2E_USER_PASS)   missingVars.push('E2E_USER_PASS');
if (!process.env.E2E_ADMIN_EMAIL) missingVars.push('E2E_ADMIN_EMAIL');
if (!process.env.E2E_ADMIN_PASS)  missingVars.push('E2E_ADMIN_PASS');

if (missingVars.length) {
    console.warn(
        `\n⚠️  Missing e2e env vars: ${missingVars.join(', ')}\n` +
        `   Copy .env.e2e.example → .env.e2e and fill in real credentials.\n` +
        `   Then run: npx dotenv -e .env.e2e -- npx playwright test\n`
    );
}

export const TEST_USER = {
    email:    process.env.E2E_USER_EMAIL,
    password: process.env.E2E_USER_PASS,
    name:     'Test User',
};

export const ADMIN_USER = {
    email:    process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASS,
};

/**
 * Log in as the given user via the UI and wait for the home page to load.
 */
export async function loginAs(page, user) {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/^password/i).fill(user.password);
    await page.locator('input[type="submit"][value="Login"]').click();
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
