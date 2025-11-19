import { setWorldConstructor, World, IWorldOptions, } from '@cucumber/cucumber'
import type { BrowserContext, Page, APIRequestContext } from 'playwright'
// import { DbClient } from '../helpers/db/DbClient';
import { Attachment } from '../helpers/attachment'


export interface ICustomWorld extends World {
    context?: BrowserContext
    page?: Page
    baseUrl: string
    featureData?: any
    request?: APIRequestContext; // <-- BARU: Untuk Klien API
    attachment: Attachment;
    
    // db?: DbClient;
}


class CustomWorld extends World implements ICustomWorld {
    context?: BrowserContext
    page?: Page
    baseUrl: string
    attachment: Attachment;


    constructor(options: IWorldOptions) {
        super(options)
        this.baseUrl = process.env.BASE_URL ?? 'https://opensource-demo.orangehrmlive.com/web/index.php'
        this.attachment = new Attachment(this);
    }
}


setWorldConstructor(CustomWorld)