import { When, Then, Given } from "@cucumber/cucumber";
import { ICustomWorld } from '../support/world';
import { GraphChartPage } from "../pages/GraphChartPage";

When('I create team group', async function (this: ICustomWorld) {
    const graphChart = new GraphChartPage(this.page!);
    await graphChart.createTeamColorMap();
});

When('I get data periode', async function (this: ICustomWorld) {
    const graphChart = new GraphChartPage(this.page!);
    await graphChart.mappingPeriod();
})

Then('I search data in periode {string}',async function (this: ICustomWorld, month: string) {
    const graphChart = new GraphChartPage(this.page!);
    await graphChart.getGraphDataByMonth(month);
})

Then('I verify graph chart labels match calculated data points for periode {string}', async function (this: ICustomWorld, month: string) {
    const graphChart = new GraphChartPage(this.page!);
    await graphChart.verifyGraphChartLabels(month);
});