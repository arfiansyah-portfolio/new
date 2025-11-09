import { setWorldConstructor, World, IWorldOptions, } from '@cucumber/cucumber'
import type { BrowserContext, Page, APIRequestContext } from 'playwright'
// import { DbClient } from '../helpers/db/DbClient';


export interface ICustomWorld extends World {
    context?: BrowserContext
    page?: Page
    baseUrl: string
    featureData?: any
    request?: APIRequestContext; // <-- BARU: Untuk Klien API
    // db?: DbClient;
}


class CustomWorld extends World implements ICustomWorld {
    context?: BrowserContext
    page?: Page
    baseUrl: string


    constructor(options: IWorldOptions) {
        super(options)
        this.baseUrl = process.env.BASE_URL ?? 'https://opensource-demo.orangehrmlive.com/web/index.php'
    }
}


setWorldConstructor(CustomWorld)