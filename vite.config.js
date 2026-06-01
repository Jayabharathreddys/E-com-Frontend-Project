import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        css: true,
        // Exclude Playwright e2e specs — they must be run via `npx playwright test`
        exclude: ['**/node_modules/**', '**/e2e/**', '**/*.spec.js'],
    },
});
