import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './src',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: null,
                launchOptions: {
                    args: [
                        '--start-maximized',
                        '--window-size=1920,1080'
                    ]
                }
            },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                launchOptions: {
                    args: ['-start-maximized'],
                },
                viewport: null,
            },
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: null,
            },
        },
    ],
});
