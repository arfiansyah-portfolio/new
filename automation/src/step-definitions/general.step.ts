import { When, Then, Given } from "@cucumber/cucumber";
import { ICustomWorld } from '../support/world';
import { log } from '../logger/logger';

import {
    smartClick,
    smartFill,
    smartSelect,
    smartAssertVisible,
    smartWaitForHidden
} from '../utils';

import { getData, requireDatatest } from '../helpers';

function toCamelCase(str: string): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '')
        .replace(/^./, (match) => match.toLowerCase());
}

// =================================================================
// CATEGORY 1: "SMART" STEPS (Data-Driven from Store)
// =================================================================

When('I fill the {string} field', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Filling: "${elementName}" (Data Key: "${dataKey}")`);

    requireDatatest(dataKey);
    const valueToFill = getData(dataKey);

    await smartFill(this.page!, elementName, valueToFill);
});

When('I select an option for {string}', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Selecting: "${elementName}" (Data Key: "${dataKey}")`);

    requireDatatest(dataKey);
    const optionToSelect = getData(dataKey);

    await smartSelect(this.page!, elementName, optionToSelect);
});

When('I set the {string} date', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Setting Date: "${elementName}" (Data Key: "${dataKey}")`);

    requireDatatest(dataKey);
    const dateValue = getData(dataKey);

    log.warn(`  ⚠️ Using 'smartFill' fallback for datepicker. Create 'smartSetDatepicker' for better handling.`);
    await smartFill(this.page!, elementName, dateValue);
});

When('I set the {string} checkbox', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Setting Checkbox: "${elementName}" (Data Key: "${dataKey}")`);

    requireDatatest(dataKey);
    const shouldBeChecked = getData(dataKey);

    log.warn(`  ⚠️ 'smartSetCheckbox' is missing. Skipping step.`);
});

When('I click {string}', async function (this: ICustomWorld, elementName: string) {
    log.step(`[General] Clicking: "${elementName}"`);
    await smartClick(this.page!, elementName);
});

Then('I should see the {string}', async function (this: ICustomWorld, elementNameOrKey: string) {
    const dataKey = toCamelCase(elementNameOrKey);
    log.step(`[General] Asserting: "${elementNameOrKey}" (Data Key: "${dataKey}")`);

    requireDatatest(dataKey);
    const expectedText = getData(dataKey);

    await smartAssertVisible(this.page!, expectedText, 'start');
});


// =================================================================
// CATEGORY 2: "LITERAL" STEPS (Hardcoded from Gherkin)
// =================================================================

When('I fill the {string} field with {string}', async function (this: ICustomWorld, elementName: string, literalValue: string) {
    log.step(`[General] Filling (Literal): "${elementName}" with "${literalValue}"`);
    await smartFill(this.page!, elementName, literalValue);
});

When('I select {string} for {string}', async function (this: ICustomWorld, literalOption: string, elementName: string) {
    log.step(`[General] Selecting (Literal): "${literalOption}" for "${elementName}"`);
    await smartSelect(this.page!, elementName, literalOption);
});

Then('I should see text {string}', async function (this: ICustomWorld, literalText: string) {
    log.step(`[General] Asserting (Literal): "${literalText}"`);
    await smartAssertVisible(this.page!, literalText, 'start');
});

Then('I should not see text {string}', async function (this: ICustomWorld, literalText: string) {
    log.step(`[General] Asserting Hidden (Literal): "${literalText}"`);
    await smartWaitForHidden(this.page!, literalText);
});


// =================================================================
// CATEGORY 3: GENERAL UTILITY STEPS
// =================================================================

When('I wait for the {string} to disappear', async function (this: ICustomWorld, selector: string) {
    log.step(`[General] Waiting: "${selector}" to disappear`);
    await smartWaitForHidden(this.page!, selector, { timeout: 30000 });
});

When('I refresh the page', async function (this: ICustomWorld) {
    log.step(`[General] Refreshing page`);
    await this.page!.reload();
});

When('I wait for {int} seconds', async function (this: ICustomWorld, seconds: number) {
    log.step(`[General] Waiting for ${seconds} seconds...`);
    await this.page!.waitForTimeout(seconds * 1000);
});

Given('I am on the {string}', async function (this: ICustomWorld, url: string) {
    const dataKey = toCamelCase(url);
    log.step(`[General] Opening page: "${url}"`);
    requireDatatest(dataKey);
    const urlToGo = getData(dataKey);
    await this.page!.goto(urlToGo);
});