// global.d.ts

import type { Browser, BrowserContext, Page } from '@playwright/test';
// Assuming you have a type for the Cucumber attach function
import type { CucumberAttach } from './pages/BasePage';

declare global {
    // Define types for Playwright objects you inject globally
    var browser: Browser;
    var context: BrowserContext;
    var page: Page;

    // If you made the Cucumber attach function global (global.attach)
    var attach: CucumberAttach;

    // Add any other properties you access via 'global.<property_name>'
}