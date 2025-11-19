import { When, Then, Given } from "@cucumber/cucumber";
import { ICustomWorld } from '../support/world';
import { PiechartPage } from "../pages/PiechartPage";


When('I go to basic usage', async function (this: ICustomWorld) {
    const piechart = new PiechartPage(this.page!, this);
    await piechart.goToPiechartSegment();
});

Then('I create group data by age', async function (this: ICustomWorld) {
    const piechart = new PiechartPage(this.page!, this);
    await piechart.createAllAgeGroups();
});

Then('I create percentage piechart', async function (this: ICustomWorld) {
    const piechart = new PiechartPage(this.page!, this);
    await piechart.createPercentagePiechart();
});

Then('I verify percentage piechart', async function (this: ICustomWorld) {
    const piechart = new PiechartPage(this.page!, this);
    await piechart.verifyPercentagePiechart();
});

Then('I uncheck for age group {string}', async function (this: ICustomWorld, ageGroup: string) {
    const piechart = new PiechartPage(this.page!, this);
    await piechart.uncheckAgeGroup(ageGroup);
});