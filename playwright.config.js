// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * JBE Commerce — Playwright e2e configuration
 *
 * Run against local dev server:  BASE_URL=http://localhost:5173 npx playwright test
 * Run against production:        npx playwright test  (uses Vercel URL below)
 */
module.exports = defineConfig({
    testDir: './e2e',
    timeout: 45_000,
    fullyParallel: false,           // sequential — avoids auth state conflicts
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ],
    use: {
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        baseURL: process.env.BASE_URL || 'https://e-com-frontend-project-eta.vercel.app',
        actionTimeout: 12_000,
        navigationTimeout: 25_000,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile',   use: { ...devices['iPhone 14'] } },
    ],
});
