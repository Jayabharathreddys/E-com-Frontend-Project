// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir:   './e2e',
    timeout:   30_000,
    retries:   1,          // retry once on flaky network
    reporter:  'list',
    use: {
        headless:          true,
        screenshot:        'only-on-failure',
        video:             'retain-on-failure',
        baseURL:           'https://jbe-commerceapp.netlify.app',
        actionTimeout:     10_000,
        navigationTimeout: 20_000,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
