import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1200, height: 630 },
        deviceScaleFactor: 2 // High resolution for Retina displays
    });

    console.log('Navigating to website...');
    await page.goto('https://heavyrain39.github.io/portfolio/', { waitUntil: 'networkidle' });

    console.log('Waiting for animations to complete...');
    // wait a bit for framer motion animations
    await page.waitForTimeout(3500);

    const outputPath = path.join(projectRoot, 'public', 'images', 'og-image.jpg');
    console.log(`Saving screenshot to ${outputPath}...`);

    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });

    await browser.close();
    console.log('Screenshot saved successfully!');
})();
