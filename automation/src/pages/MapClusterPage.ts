import { Page, expect, Locator } from '@playwright/test';
import { createLoggedPage } from '../helpers/playwright-logger';
import { requireDatatest, Store } from '../helpers';
import { log } from '../logger/logger';
import { ICustomWorld } from '../support/world';

export class MapClusterPage {
    mapLocator: any;
    constructor(private page: Page, private world: ICustomWorld) {
        this.mapLocator = page.frameLocator('iframe[title="Highcharts example"][src*="optimized-kmeans"]');
    }

    async verifyMapClusterMarkerVisible() {
        const page = createLoggedPage(this.page);

        const markerLocator = this.mapLocator.locator(`div#container`);
        await expect(markerLocator, `Ensure visibility`)
            .toBeVisible({ timeout: 10000 });
    }

    async createListClusterMarkers() {
        const page = createLoggedPage(this.page);

        const clusterMarkers = [];
        const markerElementsLocator = this.mapLocator
            .locator('g.highcharts-data-label')
            .locator('tspan.highcharts-text-outline');

        const markerCount = await markerElementsLocator.count();
        expect(markerCount, 'Should find markers on the map').toBeGreaterThan(0);

        for (let i = 0; i < markerCount; i++) {
            const markerElement = markerElementsLocator.nth(i);
            const markerTitle = await markerElement.textContent();

            const cleanedTitle = markerTitle!.replace(/\D/g, '');

            if (cleanedTitle !== "") {
                const markerValue = Number(cleanedTitle);
                clusterMarkers.push(markerValue);
            }
        }


        Store.carryover.put({ "clusterMarkers": clusterMarkers.sort((a, b) => a - b) });
        this.world.attachment.json("ClusterMarkers", clusterMarkers.sort((a, b) => a - b));
        log.info(`highest cluster: ${Math.max(...clusterMarkers)}`);
    }

    async clickClusterMarkerWithValue(value: number) {
        const page = createLoggedPage(this.page);
        requireDatatest("clusterMarkers");
        const clusterMarkers = Store.carryover.get("clusterMarkers") as number[];
        if (clusterMarkers.includes(value) === false) {
            throw new Error(`Cluster marker with value ${value} not found in the stored clusterMarkers list.`);
        }
        const markerElementsLocator = this.mapLocator
            .locator('g.highcharts-data-label')
            .locator('tspan.highcharts-text-outline');

        const markerCount = await markerElementsLocator.count();
        expect(markerCount, 'Should find markers on the map').toBeGreaterThan(0);

        for (let i = 0; i < markerCount; i++) {
            const markerElement = markerElementsLocator.nth(i);
            const markerTitle = await markerElement.textContent();
            const cleanedTitle = markerTitle!.replace(/\D/g, '');

            if (cleanedTitle !== "" && Number(cleanedTitle) === value) {
                log.info(`Clicking cluster marker with value: ${value}`);
                await markerElement.click({
                    force: true,
                    timeout: 10000
                });
                return;
            }
        }

        throw new Error(`Cluster marker with value ${value} not found.`);
    }

    async validateClusterMarkersList() {
        const page = createLoggedPage(this.page);
        requireDatatest("listCluster");
        const expectedMarkers = Store.datatest.get("listCluster") as string[];

        const clusterMarkers = [];
        const markerElementsLocator = this.mapLocator
            .locator('g.highcharts-data-label')
            .locator('tspan.highcharts-text-outline');

        const markerCount = await markerElementsLocator.count();
        expect(markerCount, 'Should find markers on the map').toBeGreaterThan(0);

        for (let i = 0; i < markerCount; i++) {
            const markerElement = markerElementsLocator.nth(i);
            if (!await markerElement.isVisible()) continue;
            const markerTitle = await markerElement.textContent();

            if (markerTitle !== "") {
                clusterMarkers.push(markerTitle!.replace(/\u200B/g, '').trim());
            }
        }
        log.info(`Cluster markers found: ${JSON.stringify(clusterMarkers)}`);
        expect(clusterMarkers.sort(), 'The list of cluster markers should match the expected data')
            .toEqual(expectedMarkers.sort());
            this.world.attachment.text("ClusterMarkersFound", clusterMarkers.join('\n'));
        
    }
}