/**
 * Playwright global setup — runs once before all tests.
 *
 * Warms up the Render backend (free tier spins down after 15 min inactivity).
 * A cold-start response can take 20-30 s, which exceeds the default 15 s
 * loginAs timeout and causes cascading failures across every authenticated test.
 */

import { chromium } from '@playwright/test';

const BACKEND_PING_URL =
    process.env.BACKEND_URL ||
    'https://e-com-backend-project.onrender.com/api/product?limit=1';

const WARMUP_TIMEOUT_MS = 60_000; // up to 60 s for cold start

export default async function globalSetup() {
    console.log('\n⏳  Warming up Render backend (cold-start can take ~30 s)...');
    const start = Date.now();

    let browser;
    try {
        browser = await chromium.launch();
        const page = await browser.newPage();

        await page.goto(BACKEND_PING_URL, {
            waitUntil: 'domcontentloaded',
            timeout: WARMUP_TIMEOUT_MS,
        });

        console.log(`✅  Backend warm (${((Date.now() - start) / 1000).toFixed(1)} s)\n`);
    } catch (err) {
        // Non-fatal — tests will still run; individual loginAs timeouts may occur
        console.warn(`⚠️  Backend warmup failed: ${err.message}\n`);
    } finally {
        await browser?.close();
    }
}
