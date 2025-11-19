import { When, Then, Given } from "@cucumber/cucumber";
import { ICustomWorld } from '../support/world';
import { FinancePortofolioPage } from "../pages/FinancePortofolioPage";

When('I add new stock {string}', async function (this: ICustomWorld, stockSymbol: string) {
    const financePortofolio = new FinancePortofolioPage(this.page!, this);
    await financePortofolio.addNewList(stockSymbol);
});

When('I select stock {string}', async function (this: ICustomWorld, stockSymbol: string) {
    const financePortofolio = new FinancePortofolioPage(this.page!, this);
    await financePortofolio.addNewList(stockSymbol);
});

When('I open virtualized stock list', async function (this: ICustomWorld) {
    const financePortofolio = new FinancePortofolioPage(this.page!, this);
    await financePortofolio.openVirtualized();
});

Then('I export virtualized stock list', async function (this: ICustomWorld) {
    const financePortofolio = new FinancePortofolioPage(this.page!, this);
    await financePortofolio.ExportVirtualized();
});

Then('I validate sub table', async function (this: ICustomWorld) {
    const financePortofolio = new FinancePortofolioPage(this.page!, this);
    await financePortofolio.validateSubTable();
});