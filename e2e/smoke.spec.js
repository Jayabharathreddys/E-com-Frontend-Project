// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'https://jbe-commerceapp.netlify.app';

// ── 1. Home page loads ────────────────────────────────────────────────────────
test('home page loads with products and navbar', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Nav categories present
    await expect(page.locator('text=Electronics')).toBeVisible();
    await expect(page.locator('text=Jewelery')).toBeVisible();

    // Login button visible (not logged in)
    await expect(page.locator('text=Login')).toBeVisible();

    // At least one product card with Rs. price
    await expect(page.locator('.product-item').first()).toBeVisible();
    await expect(page.locator('text=/Rs\\./')).toBeVisible();
});

// ── 2. Category filter ────────────────────────────────────────────────────────
test('clicking category filters products', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    await page.click('text=Electronics');
    await expect(page).toHaveURL(/electronics/i);
    await expect(page.locator('.product-item').first()).toBeVisible();
});

// ── 3. Login page has all elements ────────────────────────────────────────────
test('login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });

    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('text=Forgot password?')).toBeVisible();
    await expect(page.locator('text=Create a new account?')).toBeVisible();
    await expect(page.locator('input[value="Login"]')).toBeVisible();
});

// ── 4. Login field validation ────────────────────────────────────────────────
test('login shows validation errors on empty submit', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.click('input[value="Login"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
});

// ── 5. Signup page renders correctly ─────────────────────────────────────────
test('signup page renders all fields', async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });

    await expect(page.locator('text=Sign Up')).toBeVisible();
    await expect(page.locator('input[placeholder="Your name.."]')).toBeVisible();
    await expect(page.locator('input[placeholder="Your email.."]')).toBeVisible();
    await expect(page.locator('input[placeholder="Min 6 characters.."]')).toBeVisible();
    await expect(page.locator('input[placeholder="Repeat password.."]')).toBeVisible();
});

// ── 6. Signup validation ──────────────────────────────────────────────────────
test('signup shows validation error on empty submit', async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
    await page.click('input[value="Sign Up"]');
    await expect(page.locator('text=Name is required')).toBeVisible();
});

// ── 7. Forgot Password page ───────────────────────────────────────────────────
test('forgot password page renders and shows error for unknown email', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`, { waitUntil: 'networkidle' });

    await expect(page.locator('text=Forgot Password')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('text=Back to Sign In')).toBeVisible();

    // Test with unknown email
    await page.fill('input[type="email"]', 'nobody_xyz_123@nonexistent.com');
    await page.click('input[value="Send OTP"]');
    await expect(page.locator('text=/no user|not found/i')).toBeVisible({ timeout: 10000 });
});

// ── 8. Reset Password page ────────────────────────────────────────────────────
test('reset password page renders with all fields', async ({ page }) => {
    await page.goto(`${BASE}/reset-password/000000000000000000000000`, { waitUntil: 'networkidle' });

    await expect(page.locator('text=Reset Password')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter 6-digit OTP.."]')).toBeVisible();
    await expect(page.locator('input[placeholder="Min 6 characters.."]')).toBeVisible();
    await expect(page.locator('input[placeholder="Repeat new password.."]')).toBeVisible();
    await expect(page.locator('text=Request a new OTP')).toBeVisible();
});

// ── 9. 404 page ───────────────────────────────────────────────────────────────
test('unknown route shows 404 page with Go Home link', async ({ page }) => {
    await page.goto(`${BASE}/this-does-not-exist`, { waitUntil: 'networkidle' });

    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
    await expect(page.locator('text=Go Home')).toBeVisible();
});

// ── 10. Cart redirects unauthenticated user ───────────────────────────────────
test('cart page redirects to login when not authenticated', async ({ page }) => {
    // Clear any session storage
    await page.goto(BASE);
    await page.evaluate(() => sessionStorage.clear());

    await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' });

    // Should land on login page OR show "please log in" message
    const onLogin = page.url().includes('/login');
    const hasMsg  = await page.locator('text=/log in|login/i').isVisible();
    expect(onLogin || hasMsg).toBeTruthy();
});
