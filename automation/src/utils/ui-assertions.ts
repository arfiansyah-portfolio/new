import { Page, expect } from '@playwright/test';
import { log } from '../logger/logger';
import { Strategy, SmartAssertOptions } from './types';
import { executeStrategiesParallely } from './core/smart-engine';

export async function smartAssertVisible(
    page: Page,
    labelOrKey: string,
    scrollIntoView: string = 'center',
    options: SmartAssertOptions = {}
) {
    const { exactMatch = true } = options;

    const strategies: Strategy[] = [
        { name: 'By Text', locator: (r) => r.getByText(labelOrKey, { exact: exactMatch }) },
        { name: 'By Role', locator: (r) => r.getByRole('heading', { name: labelOrKey, exact: exactMatch }) },
        { name: 'By Label', locator: (r) => r.getByLabel(labelOrKey, { exact: exactMatch }) },
        { name: 'By TestId', locator: (r) => r.getByTestId(labelOrKey) },
        { name: 'By Value (Input/Textarea)', locator: (r) => r.getByDisplayValue(labelOrKey, { exact: exactMatch }) },
    ];

    try {
        await executeStrategiesParallely(page, labelOrKey, 'SmartAssertVisible', strategies, options,

            async (locator) => {
                await locator.evaluate((el, blockPosition) => el.scrollIntoView({ block: blockPosition, inline: 'center' }), scrollIntoView, { timeout: 30000 });
                await expect(locator).toBeVisible();

                log.pass(`[AssertVisible] SUCCESS: Element "${labelOrKey}" found AND is visible.`);
            }
        );
    } catch (error) {
        log.error(`[AssertVisible] FAILED: Element "${labelOrKey}" IS NOT visible.`);
        throw error;
    }
}