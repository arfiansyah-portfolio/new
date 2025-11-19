import { World } from "@cucumber/cucumber";
import { Page } from "@playwright/test";



export class Attachment {
    private world: World;

    constructor(world: World) {
        this.world = world;
    }

    /**
     * Attach a screenshot to the report
     */
    async screenshot(page: Page, fileName: string) {
        await page.waitForTimeout(1000); // wait for the page to stabilize before taking a screenshot
        const buffer = await page.screenshot();
        this.world.attach(buffer, "image/png");
    }

    /**
     * Attach a JSON object to the report
     */
    json(fileName: string, data: any) {
        const jsonString = JSON.stringify(data, null, 2);
        this.world.attach(jsonString, "application/json");
    }

    /**
     * Attach text to the report
     */
    text(fileName: string, content: string) {
        this.world.attach(content, "text/plain");
    }

    /**
     * Attach any buffer with custom MIME type
     */
    buffer(fileName: string, buffer: Buffer, mime: string) {
        this.world.attach(buffer, mime);
    }
}
