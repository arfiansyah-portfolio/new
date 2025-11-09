import { Page, Locator } from '@playwright/test';
import { log } from '../../logger/logger'; // Sesuaikan path logger Anda
import { CommonSmartOptions, Strategy } from '../types';
import { highlightElement } from '../ui-highlighter';

/**
 * CORE ENGINE (INTERNAL) - Menjalankan strategi locator secara paralel.
 * Fungsi ini tidak untuk diekspor ke step definitions.
 */
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

    // Buat array promise. Setiap promise mencoba satu strategi.
    const strategyPromises = strategies.map(async (strategy) => {
        const locator = strategy.locator(root);
        try {
            // Tunggu sampai visible.
            await locator.waitFor({ state: 'visible', timeout: timeout });
            return { strategyName: strategy.name, locator };
        } catch (error) {
            // Strategi ini gagal (timeout atau error lain).
            throw new Error(`Strategi ${strategy.name} gagal.`);
        }
    });

    try {
        // Tunggu pemenang pertama
        const winner = await Promise.any(strategyPromises);

        // Sorot elemen yang ditemukan
        await highlightElement(winner.locator);

        // Eksekusi aksi pada locator pemenang
        await actionCallback(winner.locator);

    } catch (aggregateError) {
        // Semua strategi gagal
        log.error(`❌ [${actionName}] GAGAL TOTAL. Tidak ada strategi yang menemukan "${labelOrKey}" dalam waktu ${timeout}ms.`);
        throw new Error(`${actionName} timeout: Element "${labelOrKey}" not found in ${rootLog} by any strategy.`);
    }
}