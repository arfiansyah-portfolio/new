import { Page } from '@playwright/test';
import { log } from '../logger/logger';
import { SmartWaitOptions } from './types';

export async function smartWaitForHidden(
    page: Page,
    selectors: string | string[],
    options: SmartWaitOptions = {}
) {
    const { timeout = 30000, parent } = options;
    const root = parent || page;
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

    const actionName = `SmartWaitForHidden [${selectorArray.join(', ')}]`;

    try {
        const waitPromises = selectorArray.map(selector => {
            const locator = root.locator(selector);
            return locator.waitFor({ state: 'hidden', timeout });
        });

        await Promise.all(waitPromises);

    } catch (error) {
        log.error(`[${actionName}] FAILED: Element(s) did not become hidden within ${timeout}ms.`);
        throw new Error(`${actionName} timeout: Element(s) are still visible.`);
    }
}