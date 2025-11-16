import { Page, Locator } from '@playwright/test';
import {
    Strategy,
    SmartFillOptions,
    SmartClickOptions,
    SmartSelectOptions
} from './types';
import { executeStrategiesParallely } from './core/smart-engine';

export async function smartFill(
    page: Page,
    labelOrKey: string,
    valueToFill: string,
    options: SmartFillOptions = {}
) {
    const { exactMatch = true } = options;

    const strategies: Strategy[] = [
        { name: 'By Label', locator: (r) => r.getByLabel(labelOrKey, { exact: exactMatch }) },
        { name: 'By Role Textbox', locator: (r) => r.getByRole('textbox', { name: labelOrKey, exact: exactMatch }) },
        { name: 'By Placeholder', locator: (r) => r.getByPlaceholder(labelOrKey, { exact: exactMatch }) },
        { name: 'By TestId', locator: (r) => r.getByTestId(labelOrKey) },
        { name: 'By Name (Input)', locator: (r) => r.locator(`input[name="${labelOrKey}"]`) },
        { name: 'By Name (Textarea)', locator: (r) => r.locator(`textarea[name="${labelOrKey}"]`) },
        { name: 'Near Text (Experimental)', locator: (r) => r.locator(`:text("${labelOrKey}")`).locator('xpath=following::input[1] | following::textarea[1]') }
    ];

    await executeStrategiesParallely(page, labelOrKey, 'SmartFill', strategies, options, async (locator) => {
        await locator.fill(valueToFill, { timeout: 5000 });
    });
}

export async function smartClick(
    page: Page,
    labelOrKey: string,
    options: SmartClickOptions = {}
) {
    const { exactMatch = true, force = false } = options;

    const strategies: Strategy[] = [
        { name: 'By Role Button', locator: (r) => r.getByRole('button', { name: labelOrKey, exact: exactMatch }) },
        { name: 'By Role Link', locator: (r) => r.getByRole('link', { name: labelOrKey, exact: exactMatch }) },
        { name: 'By Text', locator: (r) => r.getByText(labelOrKey, { exact: exactMatch }) },
        { name: 'By Label', locator: (r) => r.getByLabel(labelOrKey, { exact: exactMatch }) },
        { name: 'By TestId', locator: (r) => r.getByTestId(labelOrKey) },
        { name: 'By CSS ID/Class (Fuzzy)', locator: (r) => r.locator(`[id*="${labelOrKey}"], [class*="${labelOrKey}"]`) }
    ];

    await executeStrategiesParallely(page, labelOrKey, 'SmartClick', strategies, options, async (locator) => {
        try {
            await locator.click({ timeout: 5000, force: force });
        } catch (error: unknown) {
            if (error instanceof Error && !force && error.message.includes('intercepts pointer events')) {
                await locator.click({ timeout: 5000, force: true });
            } else {
                throw error;
            }
        }
    });
}

export async function smartSelect(
    page: Page,
    labelOrKey: string,
    optionText: string,
    options: SmartSelectOptions = {}
) {
    const { exactMatch = true, parent, force = false, timeout = 30000 } = options;
    const root = parent || page;
    const actionName = `SmartSelect [${labelOrKey}]`;

    try {
        const selectLocator = root.getByLabel(labelOrKey, { exact: exactMatch }).or(root.locator(`select[name="${labelOrKey}"]`));
        if (await selectLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
            await selectLocator.selectOption({ label: optionText }, { timeout: 5000, force });
            return;
        }
    } catch (ignore) { }

    const triggerStrategies: Strategy[] = [
        { name: 'Trigger by Label', locator: (r) => r.getByLabel(labelOrKey, { exact: exactMatch }) },
        { name: 'Trigger by Role Combobox', locator: (r) => r.getByRole('combobox', { name: labelOrKey, exact: exactMatch }) },
        { name: 'PrimeNG Trigger', locator: (r) => r.locator(`.p-dropdown:near(:text("${labelOrKey}"))`).first() },
        { name: 'Generic Trigger by Text', locator: (r) => r.getByText(labelOrKey, { exact: exactMatch }) }
    ];

    await executeStrategiesParallely(page, labelOrKey, `${actionName} [Trigger]`, triggerStrategies, options, async (trigger) => {
        await trigger.click({ timeout: 5000, force });

        const optionLocators = [
            page.getByRole('option', { name: optionText, exact: exactMatch }),
            page.locator(`.p-dropdown-item:has-text("${optionText}")`),
            page.locator(`li:has-text("${optionText}")`),
            page.getByText(optionText, { exact: true })
        ];

        for (const option of optionLocators) {
            try {
                await option.waitFor({ state: 'attached', timeout: 3000 });
                await option.scrollIntoViewIfNeeded({ timeout: 2000 });
                await option.click({ timeout: 3000, force });
                return;
            } catch (e) { }
        }

        throw new Error(`Trigger opened, but option "${optionText}" was not found.`);
    });
}