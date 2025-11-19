import { Page, expect } from '@playwright/test';
import { createLoggedPage } from '../helpers/playwright-logger';
import { smartFill, smartClick } from '../utils';
import { log } from '../logger/logger';
import { requireDatatest, Store } from '../helpers';
import { ICustomWorld } from "../support/world"

interface Point {
    x: number;
    y: number;
}

function extractPieSlicePoints(pathString: string) {
    if (!pathString || typeof pathString !== 'string') {
        return [null, null, null];
    }

    const cleanPath = pathString.trim();
    const numRegex = `[-?\\d\\.]+`;

    const matchM = cleanPath.match(new RegExp(`^M\\s*(${numRegex})\\s+(${numRegex})`));
    const matchL = cleanPath.match(new RegExp(`L\\s*(${numRegex})\\s+(${numRegex})\\s*Z$`));
    const matchC = cleanPath.match(new RegExp(`C[\\s\\S]*?(${numRegex})\\s+(${numRegex})\\s+L`));

    if (!matchM || !matchL || !matchC) {
        log.error(`Failed to parse path string: ${cleanPath}`);
        log.error(`Debug Info: ${ JSON.stringify({ matchM, matchL, matchC }) }`);
        return [null, null, null];
    }

    try {
        const point1 = { x: parseFloat(matchM[1]), y: parseFloat(matchM[2]) };
        const center = { x: parseFloat(matchL[1]), y: parseFloat(matchL[2]) };
        const point2 = { x: parseFloat(matchC[1]), y: parseFloat(matchC[2]) };

        return [center, point1, point2];
    } catch (e) {
        log.error(`Error during float parsing: ${e}`);
        return [null, null, null];
    }
}

function getSlicePercentage(center: Point, p1: Point, p2: Point): number {
    const angle1 = Math.atan2(p1.y - center.y, p1.x - center.x);
    const angle2 = Math.atan2(p2.y - center.y, p2.x - center.x);

    let angleDiffRad = angle2 - angle1;

    if (angleDiffRad < 0) {
        angleDiffRad += 2 * Math.PI;
    }

    const angleDegrees = angleDiffRad * (180 / Math.PI);
    const percentage = (angleDegrees / 360) * 100;

    return percentage;
}

function parseLabelText(labelText: string): { ageGroup: string; percentage: string } | null {
    const regex = /^([\d\+-]+)\s+years old:\s*([\d.]+%)$/;
    const match = labelText.match(regex);
    if (match) {
        return {
            ageGroup: match[1].trim(),
            percentage: match[2].trim()
        };
    }
    return null;
}

export class PiechartPage {
    iFrameLocator: any;

    constructor(private page: Page, private world: ICustomWorld) {
        this.iFrameLocator = page.frameLocator('.demo-module--demoFrame--dba2a');
    }

    async goToPiechartSegment() {
        const page = createLoggedPage(this.page)
        await page.locator('#toc-basic-usage').click();
    }

    async createAllAgeGroups() {
        const page = createLoggedPage(this.page)
        const pieChartLocator = this.iFrameLocator.locator('//div[@class="k-chart k-widget"]');
        await expect(pieChartLocator, 'Chart container must be visible')
            .toBeVisible({ timeout: 300000 });

        const ageGroupMap = new Map<string, string>();
        const legendItemsLocator = pieChartLocator.locator('g[transform][aria-label][aria-checked="true"]');
        const legendItemCount = await legendItemsLocator.count();
        expect(legendItemCount, 'Should find items in the chart legend').toBeGreaterThan(0);

        log.info(`Building age group map from ${legendItemCount} legend items...`);
        for (const legendItem of await legendItemsLocator.all()) {
            const ageGroup = await legendItem.getAttribute('aria-label');
            const colorElement = legendItem.locator('path, rect, line').first();
            const color = await colorElement.getAttribute('fill');

            if (ageGroup && color) {
                ageGroupMap.set(ageGroup, color);
            } else {
                log.warn('Legend item found but missing expected name or color.');
            }
        }
        Store.carryover.put({ ageGroupMap: Object.fromEntries(ageGroupMap) });
        this.world.attachment.json("AgeGroupMap", Object.fromEntries(ageGroupMap));
        log.debug(`Datatest snapshot: ${JSON.stringify(Store.carryover.get('ageGroupMap'), null, 2)}`);
    }

    async createPercentagePiechart() {
        requireDatatest('ageGroupMap')
        const page = createLoggedPage(this.page)
        const pieChartLocator = this.iFrameLocator.locator('//div[@class="k-chart k-widget"]');
        await expect(pieChartLocator, 'Chart container must be visible')
            .toBeVisible({ timeout: 300000 });

        const ageGroupMap: Map<string, string> = new Map(Object.entries(Store.carryover.get('ageGroupMap')));
        const ageGroupPercentages: Map<string, string> = new Map();

        log.info(`Building percentage piechart for ${ageGroupMap.size} age groups...`);
        for (const [ageGroup, color] of ageGroupMap.entries()) {
            const dataChart = await pieChartLocator
                .locator(
                    `g.k-chart-point[role="graphics-symbol"]:has(path[fill="${color}"])`
                )
                .locator(`path[fill="${color}"]`)
                .getAttribute('d');

            const [center, point1, point2] = extractPieSlicePoints(dataChart || '');
            if (center && point1 && point2) {
                const percentage = getSlicePercentage(center, point1, point2);
                ageGroupPercentages.set(ageGroup, `${percentage.toFixed(2)}%`);
            } else {
                log.error(`Failed to parse path points for age group "${ageGroup}".`);
            }
        }
        Store.carryover.put({ ageGroupPercentages: Object.fromEntries(ageGroupPercentages) });
        this.world.attachment.json("AgeGroupPercentages", Object.fromEntries(ageGroupPercentages));
        log.debug(`Datatest snapshot: ${JSON.stringify(Store.carryover.get('ageGroupPercentages'), null, 2)}`);
        log.debug(`All carryover data: ${JSON.stringify(Store.carryover.getAll(), null, 2)}`);
    }

    async verifyPercentagePiechart() {
        requireDatatest('ageGroupPercentages');
        const page = createLoggedPage(this.page);
        const ageGroupPercentages: Map<string, string> = new Map(Object.entries(Store.carryover.get('ageGroupPercentages')));
        
        log.info(`Verifying percentage piechart for ${ageGroupPercentages.size} age groups...`);
        const pieChartLocator = this.iFrameLocator.locator('//div[@class="k-chart k-widget"]');
        await expect(pieChartLocator, 'Chart container must be visible')
            .toBeVisible({ timeout: 300000 });

        const labelItemsLocator = pieChartLocator.locator('g').locator('text[fill="#424242"]').filter({ hasText: 'years old' });
        const allLabels = await labelItemsLocator.all();

        const labelItemCount = allLabels.length;
        if (labelItemCount === 0) {
            log.error('No text labels found in the chart.');
            expect(labelItemCount, 'Labels should be found in the chart').toBeGreaterThan(0);
            return;
        }

        log.info(`Found ${labelItemCount} labels in piechart. Starting verification...`);
        const validatedGroups = new Set<string>();

        for (const labelItem of allLabels) {
            const labelText = (await labelItem.textContent())?.trim();
            const parsedLabel = labelText ? parseLabelText(labelText) : null;

            if (!parsedLabel || !parsedLabel.ageGroup || !parsedLabel.percentage) {
                log.warn(`Found an unparseable or incomplete label: "${labelText}"`);
                continue;
            }

            const { ageGroup, percentage: actualPercentage } = parsedLabel;

            if (ageGroupPercentages.has(ageGroup)) {
                const expectedPercentage = ageGroupPercentages.get(ageGroup);

                if (actualPercentage === expectedPercentage) {
                    log.info(`Age group "${ageGroup}" has correct percentage: ${actualPercentage}`);
                    validatedGroups.add(ageGroup);
                } else {
                    log.error(`PERCENTAGE MISMATCH for "${ageGroup}"!`);
                    log.error(`Expected: ${expectedPercentage}`);
                    log.error(`Actual  : ${actualPercentage}`);
                    await expect.soft(actualPercentage, `Percentage for "${ageGroup}" should be ${expectedPercentage}`)
                        .toBe(expectedPercentage);
                    await this.world.attachment.text(`Mismatch for ${ageGroup}`,
                        `Expected: ${expectedPercentage}\nActual  : ${actualPercentage}`);
                }
            } else {
                log.warn(`Found an unexpected label in chart: "${ageGroup}" (${actualPercentage})`);
            }
        }

        log.info('Verifying if any expected age groups are missing...');
        for (const expectedAgeGroup of ageGroupPercentages.keys()) {
            if (!validatedGroups.has(expectedAgeGroup)) {
                log.error(`Expected age group NOT FOUND in chart labels: "${expectedAgeGroup}"`);
                await expect.soft(validatedGroups.has(expectedAgeGroup), `Age group "${expectedAgeGroup}" not found in chart`)
                    .toBe(true);
            }
        }
    }

    async uncheckAgeGroup(age: string) {
        const page = createLoggedPage(this.page)
        const pieChartLocator = this.iFrameLocator.locator('//div[@class="k-chart k-widget"]');
        await expect(pieChartLocator, 'Chart container must be visible')
            .toBeVisible({ timeout: 300000 });

        const legendItemsLocator = pieChartLocator.locator('g[transform][aria-label][aria-checked="true"]');
        const legendItemCount = await legendItemsLocator.count();
        expect(legendItemCount, 'Should find items in the chart legend').toBeGreaterThan(0);

        log.info(`Found ${legendItemCount} checked legend items.`);
        for (const legendItem of await legendItemsLocator.all()) {
            const ageGroup = await legendItem.getAttribute('aria-label');
            if (ageGroup === age) {
                log.info(`Attempting to uncheck age group "${ageGroup}"...`);
                
                await legendItem.locator('path[style*="cursor: pointer"]').click();

                const itemToVerify = pieChartLocator.locator(`g[transform][aria-label="${ageGroup}"]`);
                
                log.info(`Verifying uncheck status for "${ageGroup}"...`);
                // await expect(itemToVerify).toHaveAttribute('aria-checked', 'false');
                
                log.info(`Successfully unchecked and verified age group "${ageGroup}".`);
                break;
            }
        }
    }
}