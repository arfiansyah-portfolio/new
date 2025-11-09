import { BeforeAll, AfterAll, Before, BeforeStep, AfterStep, After, setDefaultTimeout, Status } from '@cucumber/cucumber'
import { chromium, Browser, APIRequestContext } from 'playwright'
import type { ICustomWorld } from './world'
import dotenv from "dotenv";
import { execSync } from "child_process";
import path from 'path'
import fs from 'fs'
import { Store } from '../helpers';
import { log } from '../logger/logger';
// import { DbClient } from '../helpers/db/DbClient';
dotenv.config({ quiet: true });

let browser: Browser
let currentFeatureName = 'unknown_feature';
// let request: APIRequestContext; // <-- BARU
// let db: DbClient;             // <-- BARU


setDefaultTimeout(30 * 1000)


BeforeAll(async () => {
    // if (process.env.CLEAR_REPORT === "true") {
    //     execSync("npm run reports:clean", { stdio: "inherit" })
    // }
    const headed = process.env.HEADLESS === 'false'
    browser = await chromium.launch({ headless: !headed })

    // db = new DbClient(); // (Asumsi DbClient.ts mengelola config internal)
    // await db.connect();
})


Before(async function (this: ICustomWorld, scenario) {
    const featureUri = scenario.gherkinDocument.uri;
    currentFeatureName = scenario.gherkinDocument.feature?.name.replace(/\s+/g, '_') || 'unknown_feature';
    if (featureUri) {
        // 2. Konversi path feature menjadi path file data JSON yang diharapkan
        // Ubah 'features/' menjadi 'datatest/' dan ekstensi '.feature' menjadi '.json'
        const dataFilePath = featureUri
            .replace(/^src\/features\//, 'src/datatest/') // Ganti folder root jika perlu
            .replace(/\.feature$/, '.json');

            log.info(`[DATA] Mencari file data di: ${dataFilePath}`);

        // 3. Cek apakah file datanya ada
        const absoluteDataPath = path.resolve(process.cwd(), dataFilePath);

        if (fs.existsSync(absoluteDataPath)) {
            // 4. Muat data dan simpan ke World
            let rawData = fs.readFileSync(absoluteDataPath, 'utf-8');
            rawData = rawData
                .replace('${LOGIN_USERNAME}', process.env.LOGIN_USERNAME || '')
                .replace('${LOGIN_PASSWORD}', process.env.LOGIN_PASSWORD || '');
            this.featureData = JSON.parse(rawData);
            Store.datatest.put(this.featureData);
            log.debug(`Datatest snapshot: ${JSON.stringify(Store.datatest.getAll(), null, 2)}`)
            if (this.featureData) {
                this.attach(
                    JSON.stringify(this.featureData, null, 2), {
                    mediaType: "application/json",
                    fileName: "Datatest"
                }
                );
            }
        } else {
            log.warn(`[DATA] No matching data file found at: ${dataFilePath}`);
            this.featureData = {}; // Set kosong agar tidak error jika diakses
        }
    }

    this.context = await browser.newContext()
    this.page = await this.context.newPage()
    // this.db = db;
})


BeforeStep(async function (step) {
    log.info(`Running step: ${step.pickleStep.text}`)
})

AfterStep(async function ({ result, pickleStep }) {
    if (result.status === Status.FAILED) {
        log.error(`Step failed: ${pickleStep.text}`);
        log.error(`Error: ${result.exception?.message}`);
    }
    await this.page.waitForTimeout(300);
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, "image/png");
});


After(async function (this: ICustomWorld, scenario) {
    if (scenario.result?.status === Status.FAILED && this.page) {
        await this.page.waitForTimeout(300);
        const screenshot = await this.page.screenshot();
        this.attach(screenshot, "image/png");
        log.error(`❌ Scenario FAILED: ${scenario.pickle.name}`)
    } else {
        log.pass(`✅ Scenario PASSED: ${scenario.pickle.name}`)
    }
    // await this.context?.close()
})



AfterAll(async () => {
    const outputFolder = getOutputFolder();
    try {
        execSync(`allure generate reports/allure-results --clean --single-file -o ${outputFolder}`, {
            stdio: 'inherit',
        });
        log.info(`✅ Single-file Allure report generated: ${outputFolder}/index.html`);
    } catch (err) {
        log.error(`❌ Failed to generate Allure report: ${err}`);
    }
    // await db?.disconnect();
    await browser?.close()
})

function getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function getOutputFolder(): string {
    const timestamp = getTimestamp();
    return path.join('reports', 'allure-report', `${currentFeatureName}_${timestamp}`);
}