import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const sites = {
    eleventy: "http://localhost:3001/",
    astro: "http://localhost:3002/",
};

for (const [name, url] of Object.entries(sites)) {
    test(`${name}: transfer size per type`, async ({ page }) => {
        const sizes: Record<string, number> = {};

        page.on("response", async (response) => {
            const type = response.request().resourceType();
            const body = await response.body().catch(() => Buffer.alloc(0));
            sizes[type] = (sizes[type] || 0) + body.length;
        });

        await page.goto(url, { waitUntil: "networkidle" });

        const kb = Object.fromEntries(
            Object.entries(sizes).map(([type, bytes]) => [type, `${(bytes / 1024).toFixed(1)} KB`])
        );
        console.log(name, kb);
    });

    test(`${name}: no accessibility violations`, async ({ page }) => {
        await page.goto(url);
        const results = await new AxeBuilder({ page }).analyze();
        console.log(name, "a11y violations:", results.violations.length);
        for (const violation of results.violations) {
            console.log(` - ${violation.id}: ${violation.help}`);
        }
        expect(results.violations).toEqual([]);
    });

    test(`${name}: mobile menu opens and closes`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(url);
        await page.locator(".hamburger").click();
        await expect(page.locator("#mobile-dialog")).toBeVisible();
        await page.locator(".close-button").click();
        await expect(page.locator("#mobile-dialog")).toBeHidden();
    });
}

test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    for (const [name, url] of Object.entries(sites)) {
        test(`${name}: content visible without JS`, async ({ page }) => {
            await page.goto(url);
            await expect(page.locator("h1")).toBeVisible();
            await expect(page.locator(".site-footer")).toBeVisible();
        });
    }
});