import { When, Then, Given } from "@cucumber/cucumber";
import { ICustomWorld } from '../support/world';
import { log } from '../logger/logger'; // Sesuaikan path

// Impor semua utilitas "Smart" Anda
import {
    smartClick,
    smartFill,
    smartSelect,
    smartAssertVisible,
    smartWaitForHidden
    // TODO: Impor utilitas baru Anda saat dibuat
    // smartSetCheckbox,
    // smartSetDatepicker,
} from '../utils';

// Impor utilitas 'getData' dan 'requireDatatest' dari Store Anda
import { getData, requireDatatest } from '../helpers'; // Sesuaikan path

/**
 * Helper internal untuk mengubah nama elemen menjadi data key.
 * Ini adalah "otak" yang menghubungkan Gherkin ke file .json Anda.
 * @example
 * "Product Name" -> "productName"
 * "Username" -> "username"
 * "Success Message" -> "successMessage"
 */
function toCamelCase(str: string): string {
    if (!str) return '';
    // "Success Message" -> "success message"
    return str
        .toLowerCase()
        // Ganti karakter non-alpha-numeric dengan spasi
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '')
        // Pastikan huruf pertama selalu kecil
        .replace(/^./, (match) => match.toLowerCase());
}

// =================================================================
// KATEGORI 1: "SMART" STEPS (Mengambil data dari Store)
// Ini adalah step utama Anda yang paling reusable.
// =================================================================

/**
 * Mengisi field, mengambil data secara otomatis dari Store.
 * @example
 * Gherkin: When I fill the "Username" field
 * Action:
 * 1. elementName = "Username"
 * 2. dataKey = toCamelCase("Username") -> "username"
 * 3. value = getData("username")
 * 4. smartFill(page, "Username", value)
 */
When('I fill the {string} field', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Mengisi: "${elementName}" (Data Key: "${dataKey}")`);
    
    // Validasi data ada di Store
    requireDatatest(dataKey);
    const valueToFill = getData(dataKey);

    await smartFill(this.page!, elementName, valueToFill);
});

/**
 * Memilih opsi dropdown, mengambil data secara otomatis dari Store.
 * @example
 * Gherkin: When I select an option for "Team"
 * Action:
 * 1. elementName = "Team"
 * 2. dataKey = toCamelCase("Team") -> "team"
 * 3. optionText = getData("team")
 * 4. smartSelect(page, "Team", optionText)
 */
When('I select an option for {string}', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Memilih: "${elementName}" (Data Key: "${dataKey}")`);
    
    // Validasi data ada di Store
    requireDatatest(dataKey);
    const optionToSelect = getData(dataKey);

    await smartSelect(this.page!, elementName, optionToSelect);
});

/**
 * [TODO: Buat utilitas 'smartSetDatepicker']
 * Mengatur tanggal, mengambil data secara otomatis dari Store.
 * @example
 * Gherkin: When I set the "Expired On" date
 */
When('I set the {string} date', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Mengatur Tanggal: "${elementName}" (Data Key: "${dataKey}")`);
    
    requireDatatest(dataKey);
    const dateValue = getData(dataKey);

    // TODO: Ganti ini dengan 'smartSetDatepicker'
    // Untuk saat ini, kita gunakan 'smartFill' sebagai fallback
    log.warn(`  ⚠️ Menggunakan fallback 'smartFill' untuk datepicker. Buat 'smartSetDatepicker' untuk penanganan yang lebih baik.`);
    await smartFill(this.page!, elementName, dateValue);
});

/**
 * [TODO: Buat utilitas 'smartSetCheckbox']
 * Mengatur checkbox, mengambil data (true/false) secara otomatis dari Store.
 * @example
 * Gherkin: When I set the "Onboarding" checkbox
 */
When('I set the {string} checkbox', async function (this: ICustomWorld, elementName: string) {
    const dataKey = toCamelCase(elementName);
    log.step(`[General] Mengatur Checkbox: "${elementName}" (Data Key: "${dataKey}")`);
    
    requireDatatest(dataKey);
    const shouldBeChecked = getData(dataKey); // Harapannya bernilai true atau false dari JSON

    // TODO: Buat 'smartSetCheckbox(page, elementName, shouldBeChecked)'
    log.warn(`  ⚠️ 'smartSetCheckbox' belum ada. Lewati langkah ini.`);
    // await smartSetCheckbox(this.page!, elementName, shouldBeChecked);
});


/**
 * Mengklik elemen. Ini adalah step "bodoh" yang sederhana karena tidak butuh data.
 * @example
 * Gherkin: When I click "Submit"
 */
When('I click {string}', async function (this: ICustomWorld, elementName: string) {
    log.step(`[General] Klik: "${elementName}"`);
    await smartClick(this.page!, elementName);
});

/**
 * Memverifikasi teks, mengambil data secara otomatis dari Store.
 * @example
 * Gherkin: Then I should see the "Success Message"
 * Action:
 * 1. dataKey = toCamelCase("Success Message") -> "successMessage"
 * 2. expectedText = getData("successMessage")
 * 3. smartAssertVisible(page, expectedText)
 */
Then('I should see the {string}', async function (this: ICustomWorld, elementNameOrKey: string) {
    const dataKey = toCamelCase(elementNameOrKey);
    log.step(`[General] Verifikasi: "${elementNameOrKey}" (Data Key: "${dataKey}")`);

    // Validasi data ada di Store
    requireDatatest(dataKey);
    const expectedText = getData(dataKey);

    await smartAssertVisible(this.page!, expectedText);
});


// =================================================================
// KATEGORI 2: "LITERAL" STEPS (Mengambil data dari Gherkin)
// Ini adalah "escape hatch" Anda untuk menguji nilai hardcoded,
// seperti pesan error atau skenario input yang salah.
// =================================================================

/**
 * Mengisi field dengan nilai literal (hardcoded) dari Gherkin.
 * @example
 * When I fill the "Username" field with "user-salah@test.com"
 */
When('I fill the {string} field with {string}', async function (this: ICustomWorld, elementName: string, literalValue: string) {
    log.step(`[General] Mengisi (Literal): "${elementName}" dengan "${literalValue}"`);
    await smartFill(this.page!, elementName, literalValue);
});

/**
 * Memilih opsi dropdown dengan nilai literal (hardcoded).
 * @example
 * When I select "Global" for "Scope"
 */
When('I select {string} for {string}', async function (this: ICustomWorld, literalOption: string, elementName: string) {
    log.step(`[General] Memilih (Literal): "${literalOption}" untuk "${elementName}"`);
    await smartSelect(this.page!, elementName, literalOption);
});

/**
 * Memverifikasi teks dengan nilai literal (hardcoded).
 * @example
 * Then I should see text "Username is required"
 */
Then('I should see text {string}', async function (this: ICustomWorld, literalText: string) {
    log.step(`[General] Verifikasi (Literal): "${literalText}"`);
    await smartAssertVisible(this.page!, literalText);
});

/**
 * Memverifikasi teks atau elemen *tidak* terlihat.
 * @example
 * Then I should not see text "Welcome, Admin"
 */
Then('I should not see text {string}', async function (this: ICustomWorld, literalText: string) {
    log.step(`[General] Verifikasi Hilang (Literal): "${literalText}"`);
    // Kita gunakan 'smartWaitForHidden' dari utilitas Anda
    await smartWaitForHidden(this.page!, literalText);
});


// =================================================================
// KATEGORI 3: LANGKAH UTILITAS UMUM
// =================================================================

/**
 * Menunggu elemen menghilang (misalnya loading spinner).
 * @example
 * When I wait for the ".spinner" to disappear
 */
When('I wait for the {string} to disappear', async function (this: ICustomWorld, selector: string) {
    log.step(`[General] Menunggu: "${selector}" menghilang`);
    await smartWaitForHidden(this.page!, selector, { timeout: 30000 });
});

/**
 * Refresh halaman.
 * @example
 * When I refresh the page
 */
When('I refresh the page', async function (this: ICustomWorld) {
    log.step(`[General] Refresh halaman`);
    await this.page!.reload();
});

/**
 * Menunggu waktu tertentu (gunakan dengan bijak!).
 * @example
 * And I wait for 5 seconds
 */
When('I wait for {int} seconds', async function (this: ICustomWorld, seconds: number) {
    log.step(`[General] Menunggu ${seconds} detik...`);
    await this.page!.waitForTimeout(seconds * 1000);
});

Given('I am on the {string}', async function (this: ICustomWorld, url: string) {
    const dataKey = toCamelCase(url);
    log.step(`[General] Membuka halaman: "${url}"`);
    requireDatatest(dataKey);
    const urlToGo = getData(dataKey); // Harapannya bernilai true atau false dari JSON
    await this.page!.goto(urlToGo);
}); 