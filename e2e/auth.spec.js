// @ts-check
const { test, expect } = require('@playwright/test');

const BASE  = 'https://jbe-commerceapp.netlify.app';
const EMAIL = `pw_e2e_${Date.now()}@yopmail.com`;
const PASS  = 'TestPass123';

// ── Signup → Login → Logout full flow ────────────────────────────────────────
test('signup creates account and redirects to login', async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });

    await page.fill('input[placeholder="Your name.."]',       'E2E Tester');
    await page.fill('input[placeholder="Your email.."]',      EMAIL);
    await page.fill('input[placeholder="Min 6 characters.."]', PASS);
    await page.fill('input[placeholder="Repeat password.."]', PASS);
    await page.click('input[value="Sign Up"]');

    // Should redirect to /login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
});

test('login with valid credentials shows greeting and logout button', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });

    await page.fill('input[placeholder="Your email.."]',    EMAIL);
    await page.fill('input[placeholder="Your Password.."]', PASS);
    await page.click('input[value="Login"]');

    // Navbar should show Logout after login
    await expect(page.locator('button:has-text("Logout")')).toBeVisible({ timeout: 10000 });
    // Login button gone
    await expect(page.locator('a:has-text("Login")')).not.toBeVisible();
});

test('login shows error for wrong password', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });

    await page.fill('input[placeholder="Your email.."]',    EMAIL);
    await page.fill('input[placeholder="Your Password.."]', 'wrongpassword');
    await page.click('input[value="Login"]');

    await expect(page.locator('text=/incorrect|invalid|not found/i')).toBeVisible({ timeout: 10000 });
});

test('logged-in user can view cart page', async ({ page }) => {
    // Login first
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="Your email.."]',    EMAIL);
    await page.fill('input[placeholder="Your Password.."]', PASS);
    await page.click('input[value="Login"]');
    await expect(page.locator('button:has-text("Logout")')).toBeVisible({ timeout: 10000 });

    // Go to home and add an item to cart
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.locator('.product-item button:has-text("Add to Cart")').first().click();

    // Navigate to cart
    await page.click('.cart-icon-container');
    await expect(page).toHaveURL(/cart/, { timeout: 5000 });

    // Cart page shows items and Pay Now
    await expect(page.locator('.cart-pay-btn')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Net Total')).toBeVisible();
});

test('logout clears auth and cart badge', async ({ page }) => {
    // Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="Your email.."]',    EMAIL);
    await page.fill('input[placeholder="Your Password.."]', PASS);
    await page.click('input[value="Login"]');
    await expect(page.locator('button:has-text("Logout")')).toBeVisible({ timeout: 10000 });

    // Logout
    await page.click('button:has-text("Logout")');

    // Login link back, Logout gone
    await expect(page.locator('a:has-text("Login")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Logout")')).not.toBeVisible();
});
