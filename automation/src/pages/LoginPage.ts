import { Page, expect } from '@playwright/test';
import { createLoggedPage } from '../helpers/playwright-logger';
import { smartFill, smartClick } from '../utils';
import { log } from '../logger/logger';
import { time } from 'console';

export class LoginPage {

    constructor(private page: Page, private baseURL?: string) { }

    async open() {
        const page = createLoggedPage(this.page)
        await page.goto(this.baseURL ? this.baseURL : 'https://opensource-demo.orangehrmlive.com/web/index.php/')
    }

    async login() {
        // requireDatatest("username", "password")
        const page = createLoggedPage(this.page)

        // await smartFill(page, 'Username', Store.datatest.get("username"))
        // await smartFill(page, 'Password', Store.datatest.get("password"))

        // Anda meng-comment smartClick, tapi Anda harusnya memanggilnya di sini
        // await smartClick(page, 'Login');

        // Kode lain yang Anda tes (saya biarkan ter-comment)
        // await smartSelect(page, 'Select One', 'Option 3')
        // await editCellInTable(
        //     page,
        //     'app-crud',
        //     { 'Name': 'Gaming Set' },
        //     'Column 8',
        //     '.pi-pencil',
        //     'click'
        // );
    }
}