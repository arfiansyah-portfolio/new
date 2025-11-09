import { Page, expect } from '@playwright/test';
// PERBAIKAN: Path-nya harus ../../helpers/index (atau .ts jika Anda pakai Solusi 2 murni)
// import { Store, requireDatatest, createLoggedPage } from '../helpers'; 
import Store from '../helpers/store'
import { createLoggedPage } from '../helpers/playwright-logger';
// PERBAIKAN: Path-nya harus ../../utils (dan butuh /index atau nama file.ts)
import { smartFill, smartClick } from '../utils';

export class LoginPage {

    constructor(private page: Page, private baseURL?: string) { }

    async open() {
        const page = createLoggedPage(this.page)
        await page.goto(this.baseURL ? this.baseURL : 'https://opensource-demo.orangehrmlive.com/web/index.php/')
    }

    async login() {
        // requireDatatest("username", "password")
        const page = createLoggedPage(this.page)

        await smartFill(page, 'Username', Store.datatest.get("username"))
        await smartFill(page, 'Password', Store.datatest.get("password"))

        // Anda meng-comment smartClick, tapi Anda harusnya memanggilnya di sini
        await smartClick(page, 'Login');

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