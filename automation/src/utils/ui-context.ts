import { Page, FrameLocator } from '@playwright/test';
import { log } from '../logger/logger';
import { SmartFrameOptions } from './types';

export async function smartGetFrame(
    page: Page,
    selectorOrName: string,
    options: SmartFrameOptions = {}
): Promise<FrameLocator> {
    const { timeout = 10000 } = options;
    const actionName = `SmartGetFrame [${selectorOrName}]`;

    try {
        const frameLocator = page.frameLocator(selectorOrName);
        await frameLocator.locator('body').waitFor({ state: 'visible', timeout });
        return frameLocator;

    } catch (e1) {
        try {
            const frame = page.frame(selectorOrName);
            if (frame) {
                const frameLocator = frame.frameLocator(':root');
                await frameLocator.locator('body').waitFor({ state: 'visible', timeout });
                return frameLocator;
            }
            throw new Error('Frame not found via name/id');
        } catch (e2) {
            log.error(`[${actionName}] FAILED: iFrame "${selectorOrName}" not found or loaded within ${timeout}ms.`);
            throw new Error(`${actionName} Failed: iFrame could not be found or loaded.`);
        }
    }
}