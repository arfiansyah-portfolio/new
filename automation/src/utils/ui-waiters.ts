import { Page } from '@playwright/test';
import { log } from '../logger/logger'; // Sesuaikan path logger Anda
import { SmartWaitOptions } from './types';

/**
 * Smart Wait For Hidden: Menunggu satu atau beberapa elemen menghilang.
 * Penting untuk menunggu loading spinner, modal, atau toast.
 */
export async function smartWaitForHidden(
    page: Page,
    selectors: string | string[], // misal: '[role="progressbar"]' atau ['.loader']
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
        log.error(`❌ [${actionName}] GAGAL: Elemen tidak menghilang dalam ${timeout}ms.`);
        throw new Error(`${actionName} timeout: Elemen masih terlihat.`);
    }
}