import { Given, When, Then } from "@cucumber/cucumber";
import type { ICustomWorld } from '../support/world'
import { LoginPage } from "../pages/LoginPage";

Given('I am on the login page', async function (this: ICustomWorld) {
    const login = new LoginPage(this.page!, this.baseUrl)
    await login.open()
})


When(/I login with valid credential|I login with invalid credential/, async function (this: ICustomWorld) {
    const login = new LoginPage(this.page!, this.baseUrl)
    await login.login()
})
// Then('I should see the dashboard page', async function (this: ICustomWorld) {
//     // Implementasi verifikasi halaman dashboard di sini
//     // Misalnya, periksa apakah elemen tertentu ada di halaman
//     // await this.page?.waitForSelector('selector-for-dashboard-element');
// });