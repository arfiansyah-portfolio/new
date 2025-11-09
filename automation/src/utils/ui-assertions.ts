import { Page } from '@playwright/test';
import { log } from '../logger/logger'; // Sesuaikan path logger Anda
import { Strategy, SmartAssertOptions } from './types';
import { executeStrategiesParallely } from './core/smart-engine';

/**
 * Smart Assert Visible: Memverifikasi elemen terlihat di halaman.
 * Tes akan GAGAL jika elemen tidak ditemukan dalam timeout.
 */
export async function smartAssertVisible(
    page: Page,
    labelOrKey: string,
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
                log.pass(`✅ [AssertVisible] Sukses: Elemen "${labelOrKey}" terlihat.`);
                // await locator.highlight(); // Opsional: highlight elemen
            }
        );
    } catch (error) {
        log.error(`❌ [AssertVisible] GAGAL: Elemen "${labelOrKey}" TIDAK terlihat.`);
        throw error; // Lempar error kembali agar tes gagal
    }
}