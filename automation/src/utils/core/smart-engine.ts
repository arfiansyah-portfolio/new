import { Page, Locator } from '@playwright/test';
import { log } from '../../logger/logger';
import { CommonSmartOptions, Strategy } from '../types';
import { highlightElement } from '../ui-highlighter';

export async function executeStrategiesParallely(
    page: Page,
    labelOrKey: string,
    actionName: string,
    strategies: Strategy[],
    options: CommonSmartOptions,
    actionCallback: (locator: Locator) => Promise<void>
) {
    const { exactMatch = true, timeout = 30000, parent } = options;
    const root = parent || page;
    const rootLog = parent ? 'Parent Scope' : 'Global Page';

    const strategyPromises = strategies.map(async (strategy) => {
        const locator = strategy.locator(root);
        try {
            await locator.waitFor({ state: 'visible', timeout: timeout });
            return { strategyName: strategy.name, locator };
        } catch (error) {
            throw new Error(`Strategy ${strategy.name} failed.`);
        }
    });

    try {
        const winner = await Promise.any(strategyPromises);

        await highlightElement(winner.locator);

        await actionCallback(winner.locator);

    } catch (aggregateError) {
        log.error(`[${actionName}] TOTAL FAILURE. No strategy found "${labelOrKey}" within ${timeout}ms.`);
        throw new Error(`${actionName} timeout: Element "${labelOrKey}" not found in ${rootLog} by any strategy.`);
    }
}