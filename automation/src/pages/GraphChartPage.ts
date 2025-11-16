import { Page, expect, Locator } from '@playwright/test';
import { createLoggedPage } from '../helpers/playwright-logger';
import { requireDatatest, Store } from '../helpers';

function toCamelCase(str: string): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '')
        .replace(/^./, (match) => match.toLowerCase());
}

export class GraphChartPage {
    graphLocator: Locator;
    constructor(private page: Page) {
        this.graphLocator = page.locator('//div[@class="k-chart k-widget"]');
    }

    async createTeamColorMap() {
        const page = createLoggedPage(this.page);

        const teamColorMap = new Map<string, string>();
        const legendItemsLocator = this.graphLocator.locator('g[transform][aria-label]');
        const legendItemCount = await legendItemsLocator.count();
        expect(legendItemCount, 'Should find items in the chart legend').toBeGreaterThan(0);

        for (const legendItem of await legendItemsLocator.all()) {
            const teamName = await legendItem.getAttribute('aria-label');
            const colorElement = legendItem.locator('path, rect, line').first();
            const color = (await colorElement.getAttribute('stroke')) || (await colorElement.getAttribute('fill'));

            if (teamName && color) {
                teamColorMap.set(color, teamName);
            }
        }

        Store.carryover.put({ "teamMap": Object.fromEntries(teamColorMap) });
    }

    async mappingPeriod() {
        const VALID_MONTHS_SORTED = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december",
            "jan", "feb", "mar", "apr", "may", "jun",
            "jul", "aug", "sep", "oct", "nov", "dec"
        ].sort((a, b) => b.length - a.length);

        const monthIndexMap = new Map<string, { index: number; rawText: string }>();

        const axisLabelsLocator = this.graphLocator.locator('text');
        await expect(axisLabelsLocator.first(), 'Waiting for the first X-axis label (e.g., Jan) to appear')
            .toBeVisible();

        const labelCount = await axisLabelsLocator.count();
        expect(labelCount, 'Should find text elements within the chart').toBeGreaterThan(0);

        let axisIndex = 0;
        for (const label of await axisLabelsLocator.all()) {
            const rawText = (await label.textContent() || '').trim();
            const monthName = rawText.toLowerCase();

            if (!monthName) continue;

            for (const month of VALID_MONTHS_SORTED) {
                if (monthName.startsWith(month)) {
                    if (!monthIndexMap.has(month)) {
                        monthIndexMap.set(month, { index: axisIndex, rawText });
                        axisIndex++;
                    }
                    break;
                }
            }
        }

        Store.carryover.put({ "periode": Object.fromEntries(monthIndexMap) });

        expect(monthIndexMap.size, 'X-Axis Map (Month -> Index) should not be empty')
            .toBeGreaterThan(0);
    }

    async getGraphDataByMonth(month: string) {
        requireDatatest("periode");

        const periode = Store.carryover.get("periode");
        const monthKey = toCamelCase(month);
        const monthInfo = periode[monthKey];

        expect(monthInfo, `Month "${month}" (key: ${monthKey}) was not found in the chart X-axis map.`)
            .toBeDefined();

        const targetIndex = monthInfo.index;
        const expectedMonthText = monthInfo.rawText;
    }

    async verifyGraphChartLabels(month: string) {
        const page = createLoggedPage(this.page);
        requireDatatest("periode", "teamMap");

        const monthKey = toCamelCase(month);
        const periode = Store.carryover.get("periode");
        const teamMap = Store.carryover.get("teamMap");

        const monthInfo = periode[monthKey];
        expect(monthInfo, `Month "${month}" (key: ${monthKey}) was not found in the chart X-axis map.`)
            .toBeDefined();

        const targetIndex = monthInfo.index;
        const expectedMonthText = monthInfo.rawText;

        const tooltipLocator = page.locator('div.k-chart-tooltip, div.k-tooltip').first();
        const seriesContainer = this.graphLocator.locator('g[clip-path]');

        for (const [color, teamName] of Object.entries(teamMap)) {
            const dataPointLocator = seriesContainer
                .locator(`circle.k-chart-point[stroke="${color}"]`)
                .nth(targetIndex);

            const expectedValue = await dataPointLocator.getAttribute('aria-label');
            expect(expectedValue, `Data point for ${teamName} should have an aria-label (value)`)
                .toBeDefined();

            await dataPointLocator.hover({ force: true });

            await expect(tooltipLocator, `Tooltip for ${teamName} should be visible`)
                .toBeVisible({ timeout: 30000 });

            const tooltipMonthLocator = tooltipLocator.locator('div > div:first-child');
            await expect(tooltipMonthLocator, `Tooltip should contain the correct month: "${expectedMonthText}"`)
                .toHaveText(expectedMonthText);

            const tooltipValueLocator = tooltipLocator.locator('div > div:nth-child(2)');
            const tooltipValueText = (await tooltipValueLocator.textContent()) || '';

            const normalizedTooltipValue = tooltipValueText.replace(/,/g, '');
            const normalizedExpectedValue = expectedValue!.replace(/,/g, '');

            expect(normalizedTooltipValue, 'Value in tooltip (after normalization) should match the aria-label')
                .toEqual(normalizedExpectedValue);

            await page.mouse.move(0, 0);
            await expect(tooltipLocator).not.toBeVisible();
        }
    }
}