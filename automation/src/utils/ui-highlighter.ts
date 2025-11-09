import { Locator } from '@playwright/test';
import { log } from '../logger/logger'; // Sesuaikan path

/**
 * Highlights a given locator in the browser for debugging.
 * Controlled by the environment variable `HIGHLIGHT_ELEMENTS=true`.
 *
 * @param locator - The Playwright Locator to highlight.
 * @param durationMs - How long the highlight should stay (default 1500ms).
 */
export async function highlightElement(locator: Locator, durationMs: number = 1500) {
    // Only run if the environment variable is set
    if (process.env.HIGHLIGHT_ELEMENTS !== 'true') {
        return;
    }

    try {
        // Use evaluate to run code in the browser's context
        await locator.evaluate((element, duration) => {
            // Save the original style to restore it later
            const originalOutline = element.style.outline;
            const originalBoxShadow = element.style.boxShadow;

            // Apply a very visible style
            element.style.outline = '3px solid #FF4500'; // Bright orange
            element.style.boxShadow = '0 0 10px 3px #FF4500'; // Add a glow

            // Set a timeout to remove the style after the duration
            setTimeout(() => {
                element.style.outline = originalOutline;
                element.style.boxShadow = originalBoxShadow;
            }, duration);
        }, durationMs); // Pass duration in as an argument
    } catch (e: unknown) {
        // Log if highlighting fails, but don't stop the test
        log.warn(`[Highlighter] Gagal menyorot elemen: ${(e as Error).message}`);
    }
}