import { Locator } from '@playwright/test';
import { log } from '../logger/logger'; 

export async function highlightElement(locator: Locator, durationMs: number = 1500) {
    if (process.env.HIGHLIGHT_ELEMENTS !== 'true') {
        return;
    }

    try {
        await locator.evaluate((element, duration) => {
            const originalOutline = element.style.outline;
            const originalBoxShadow = element.style.boxShadow;

            element.style.outline = '3px solid #FF4500'; 
            element.style.boxShadow = '0 0 10px 3px #FF4500'; 

            setTimeout(() => {
                element.style.outline = originalOutline;
                element.style.boxShadow = originalBoxShadow;
            }, duration);
        }, durationMs); 
    } catch (e: unknown) {
        log.warn(`[Highlighter] Gagal menyorot elemen: ${(e as Error).message}`);
    }
}