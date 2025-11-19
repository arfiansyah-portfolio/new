import { When, Then, Given } from "@cucumber/cucumber";
import { ICustomWorld } from '../support/world';
import { MapClusterPage } from "../pages/MapClusterPage";

When('I see the map cluster', async function (this: ICustomWorld) {
    const mapClusterPage = new MapClusterPage(this.page!, this);
    await mapClusterPage.verifyMapClusterMarkerVisible();
});

When('I create list of map cluster markers', async function (this: ICustomWorld) {
    const mapClusterPage = new MapClusterPage(this.page!, this);
    await mapClusterPage.createListClusterMarkers();
});
Then('I click cluster marker number {string}', async function (this: ICustomWorld, markerNumber: string) {
    const mapClusterPage = new MapClusterPage(this.page!, this);
    await mapClusterPage.clickClusterMarkerWithValue(Number(markerNumber));
});

Then('I verify map cluster markers match datatest list', async function (this: ICustomWorld) {
    const mapClusterPage = new MapClusterPage(this.page!, this);
    await mapClusterPage.validateClusterMarkersList();
});