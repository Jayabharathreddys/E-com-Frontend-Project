// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';

// Auto-load .env.e2e without requiring the dotenv package
if (existsSync('.env.e2e')) {
    for (const line of readFileSync('.env.e2e', 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !(key in process.env)) process.env[key] = val;
    }
}

/**
 * JBE Commerce — Playwright e2e configuration
 *
 * Run against local dev server:  BASE_URL=http://localhost:5173 npx playwright test
 * Run against production:        npx playwright test  (uses Vercel URL below)
 */
export default defineConfig({
    testDir: './e2e',
    globalSetup: './e2e/global-setup.js',
    timeout: 60_000,         // increased: Render cold-start can take 30 s
    fullyParallel: false,
    retries: process.env.CI ? 2 : 1,
    workers: 1, // always 1 — specs share backend auth state for the same test accounts
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ],
    use: {
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        // Default to local dev server — set BASE_URL=https://... for production runs
        baseURL: process.env.BASE_URL || 'http://localhost:5173',
        actionTimeout: 20_000,       // increased from 12 s
        navigationTimeout: 35_000,   // increased from 25 s
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile',   use: { ...devices['iPhone 14'] } },
    ],
});
