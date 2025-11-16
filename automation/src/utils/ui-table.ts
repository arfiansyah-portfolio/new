import { Page, Locator, expect } from '@playwright/test';
import { log } from '../logger/logger'; // Asumsi Anda memiliki logger

// --- Private Helper ---
// (Fungsi ini tidak diekspor, hanya digunakan di dalam file ini)

/**
 * Menemukan 'aria-colindex' untuk nama kolom yang diberikan dari dalam header grid.
 * @param headerLocator Locator ke '.k-grid-header-table'
 * @param columnName Teks header kolom (misal: "Symbol" atau "Price")
 * @returns {string} Nilai string dari aria-colindex (misal: "2")
 */
async function _getColumnIndex(headerLocator: Locator, columnName: string): Promise<string> {
    const headerCells = await headerLocator.locator('th[aria-colindex]').all();

    for (const cell of headerCells) {
        const textContent = await cell.textContent();
        if (textContent && textContent.trim().includes(columnName)) {
            const index = await cell.getAttribute('aria-colindex');
            if (index) {
                log.debug(`Mapped column "${columnName}" to aria-colindex "${index}"`);
                return index;
            }
        }
    }

    // Fallback untuk kolom kustom <a> (jika tidak ada di <th>)
    let colIndex = 1;
    for (const header of await headerLocator.locator('tr').first().locator('th, a').all()) {
        const text = await header.textContent();
        if (text && text.includes(columnName)) {
            log.warn(`Falling back to visual index for column "${columnName}": ${colIndex}`);
            return colIndex.toString();
        }
        colIndex++;
    }

    throw new Error(`UiTableUtils: Tidak dapat menemukan indeks kolom untuk header: "${columnName}"`);
}

// --- Metode Utilitas Publik ---
// (Ini adalah fungsi yang Anda impor dan gunakan di file tes Anda)

/**
 * 1. Menggulir grid agar terlihat di layar.
 * @param gridBaseLocator Locator untuk kontainer grid utama (misal: page.locator('div.k-grid'))
 */
export async function uiTableScroll(gridBaseLocator: Locator) {
    log.info('Scrolling grid into view...');
    await gridBaseLocator.scrollIntoViewIfNeeded();
}

/**
 * Menemukan satu baris <tr> berdasarkan kriteria pencarian.
 * @param page Instance Page Playwright
 * @param gridBaseLocator Locator untuk kontainer grid utama
 * @param criteria Objek yang memetakan nama kolom ke nilai sel.
 * @returns Locator untuk <tr> pertama yang cocok.
 */
export async function getUiTableRowLocator(
    page: Page,
    gridBaseLocator: Locator,
    criteria: { [key: string]: string }
): Promise<Locator> {
    const dataLocator = gridBaseLocator.locator('.k-table-tbody, .k-grid-table > .k-table-tbody');
    const headerLocator = gridBaseLocator.locator('.k-grid-header-table');
    let row = dataLocator.locator('tr');

    log.debug(`Mencari baris dengan kriteria: ${JSON.stringify(criteria)}`);

    for (const [columnName, cellValue] of Object.entries(criteria)) {
        const columnIndex = await _getColumnIndex(headerLocator, columnName);

        row = row.filter({
            has: page.locator(`td[aria-colindex="${columnIndex}"]`).filter({ hasText: cellValue })
        });
    }

    return row.first();
}

/**
 * 2. Mengklik baris yang cocok dengan kriteria tertentu.
 * @param page Instance Page Playwright
 * @param gridBaseLocator Locator untuk kontainer grid utama
 * @param criteria Objek kriteria, misal: { "Symbol": "MSFT" }
 */
export async function uiTableClickRow(
    page: Page,
    gridBaseLocator: Locator,
    criteria: { [key: string]: string }
) {
    // Menggunakan kembali fungsi getUiTableRowLocator
    const row = await getUiTableRowLocator(page, gridBaseLocator, criteria);
    log.info(`Clicking row matching: ${JSON.stringify(criteria)}`);
    await expect(row, `Baris yang cocok ${JSON.stringify(criteria)} harus ada`).toBeVisible();
    await row.click();
}

/**
 * 3. Memvalidasi bahwa baris yang cocok dengan kriteria ada dan terlihat.
 * @param page Instance Page Playwright
 * @param gridBaseLocator Locator untuk kontainer grid utama
 * @param criteria Objek kriteria, misal: { "Name": "Microsoft" }
 */
export async function uiTableValidateRowExists(
    page: Page,
    gridBaseLocator: Locator,
    criteria: { [key: string]: string },
    options: { timeout?: number } = {} // <-- TAMBAHKAN OPSI
) {
    // Menggunakan kembali fungsi getUiTableRowLocator
    const row = await getUiTableRowLocator(page, gridBaseLocator, criteria);

    // Gunakan timeout kustom, atau default Playwright (5000ms)
    const validationTimeout = options.timeout || 5000; // <-- GUNAKAN TIMEOUT

    log.info(`Validating row exists: ${JSON.stringify(criteria)} (timeout: ${validationTimeout}ms)`);

    // Terapkan timeout ke assertion
    await expect(row, `Baris yang cocok ${JSON.stringify(criteria)} harus terlihat`).toBeVisible({ timeout: validationTimeout }); // <-- TERAPKAN TIMEOUT
}

/**
 * Mendapatkan locator sel <td> dari baris <tr> yang sudah ditemukan.
 * @param gridBaseLocator Locator untuk kontainer grid utama
 * @param row Locator untuk <tr> (dari getUiTableRowLocator)
 * @param columnName Nama kolom yang selnya ingin Anda dapatkan.
 * @returns Locator untuk <td>.
 */
export async function getUiTableCell(
    gridBaseLocator: Locator,
    row: Locator,
    columnName: string
): Promise<Locator> {
    const headerLocator = gridBaseLocator.locator('.k-grid-header-table');
    const columnIndex = await _getColumnIndex(headerLocator, columnName);
    return row.locator(`td[aria-colindex="${columnIndex}"]`);
}