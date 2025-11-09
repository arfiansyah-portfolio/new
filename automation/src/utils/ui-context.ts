import { Page, FrameLocator } from '@playwright/test';
import { log } from '../logger/logger'; // Sesuaikan path logger Anda
import { SmartFrameOptions } from './types';

/**
 * Smart Get Frame: Menemukan iFrame dan mengembalikan FrameLocator.
 *
 * @example
 * const myFrame = await smartGetFrame(page, '#my-iframe-selector');
 * await smartClick(page, 'Submit Button', { parent: myFrame });
 */
export async function smartGetFrame(
    page: Page,
    selectorOrName: string,
    options: SmartFrameOptions = {}
): Promise<FrameLocator> {
    const { timeout = 10000 } = options;
    const actionName = `SmartGetFrame [${selectorOrName}]`;

    try {
        // Strategi 1: Cari berdasarkan CSS selector
        const frameLocator = page.frameLocator(selectorOrName);
        await frameLocator.locator('body').waitFor({ state: 'visible', timeout });
        return frameLocator;

    } catch (e1) {
        // Strategi 2: Cari berdasarkan atribut 'name' atau 'id'
        try {
            const frame = page.frame(selectorOrName);
            if (frame) {
                const frameLocator = frame.frameLocator(':root');
                await frameLocator.locator('body').waitFor({ state: 'visible', timeout });
                return frameLocator;
            }
            throw new Error('Frame tidak ditemukan via name/id');
        } catch (e2) {
            log.error(`❌ [${actionName}] GAGAL: iFrame "${selectorOrName}" tidak ditemukan atau dimuat dalam ${timeout}ms.`);
            throw new Error(`${actionName} Gagal: iFrame tidak dapat ditemukan atau dimuat.`);
        }
    }
}