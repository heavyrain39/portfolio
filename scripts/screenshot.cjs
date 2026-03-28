const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to your app's 404 cockpit layout
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto('http://localhost:3000/test-404', { waitUntil: 'networkidle' });
  
  // Wait a few extra seconds for the R3F canvas and animations to render
  await page.waitForTimeout(4000);
  
  // Take screenshot
  await page.screenshot({ path: 'C:\\Users\\야차완\\Desktop\\Portfolio\\public\\cockpit-screenshot.png' });
  console.log('Screenshot saved to public/cockpit-screenshot.png');
  
  await browser.close();
})();
