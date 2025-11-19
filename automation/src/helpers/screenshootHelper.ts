import { World } from "@cucumber/cucumber";
import { Page } from "@playwright/test";

export class ScreenshotHelper {
    private world: World;

    constructor(world: World) {
        this.world = world;
    }

    async takeAndAttach(page: Page, name: string) {
        const buffer = await page.screenshot({ path: `./reports/${name}.png` });

        // Attach to Cucumber report
        this.world.attach(buffer, "image/png");

        return buffer;
    }
}
