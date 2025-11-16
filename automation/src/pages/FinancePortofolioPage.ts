import { Locator, Page, expect } from '@playwright/test';
import { createLoggedPage } from '../helpers/playwright-logger';
import { requireDatatest, Store } from '../helpers';
import { smartClick, smartFill, uiTableClickRow, uiTableScroll, uiTableValidateRowExists } from '../utils';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');


export class FinancePortofolioPage {

    tableStock: Locator;
    constructor(private page: Page) {
        this.tableStock = page.locator('div.k-grid');
    }

    async addNewList(newListName: string) {
        const page = createLoggedPage(this.page);

        await uiTableScroll(this.tableStock);

        await smartClick(page, 'Add new');

        await smartFill(page, 'Filter', newListName);

        await smartClick(page, newListName);

        await uiTableValidateRowExists(
            page,
            this.tableStock,
            { 'Symbol': newListName },
            { timeout: 15000 }
        );
    }

    async selectStockRow(stockName: string) {
        const page = createLoggedPage(this.page);

        await uiTableClickRow(
            page,
            this.tableStock,
            { 'Symbol': stockName }
        );
    }

    async openVirtualized() {
        const page = createLoggedPage(this.page);
        await smartClick(page, 'Virtualized');
    }

    async ExportVirtualized() {
        const page = createLoggedPage(this.page);
        const downloadsDir = path.join(process.cwd(), 'temp-downloads');
        fs.mkdirSync(downloadsDir, { recursive: true });

        const downloadPromise = page.waitForEvent('download');
        await smartClick(page, 'Export to PDF');

        const download = await downloadPromise;

        const suggestedFilename = 'export.pdf';

        const filePath = path.join(downloadsDir, suggestedFilename);
        await download.saveAs(filePath);

        const dataBuffer = fs.readFileSync(filePath);

        const data = await pdfParse(dataBuffer);

        const pdfText = data.text;

        expect(download.suggestedFilename()).toBe(suggestedFilename);
        expect(pdfText).toBeTruthy();

        const targetCustomerID = 'ALFKI';
        const pattern = new RegExp(`^.*(${targetCustomerID}).*$`, 'gm');
        const match = pdfText.match(pattern);

        let extractedData = null;

        if (match && match.length > 0) {
            extractedData = match[0].trim();
            console.log(`Extracted data line: ${extractedData}`);
        } else {
            throw new Error(`Failed to find data for CustomerID: ${targetCustomerID} inside the PDF.`);
        }
    }

    async validateSubTable() {
        const page = createLoggedPage(this.page);

        const subtableLocator = this.tableStock.locator('td.k-table-td.k-hierarchy-cell[aria-expanded]').getByLabel("Expand detail row").first();
        await subtableLocator.click();

        const detailTableLocator = this.tableStock.locator('td.k-table-td.k-detail-cell')
        
        expect(detailTableLocator, 'Detail table should be visible after expanding the row').toBeVisible();
    }
}