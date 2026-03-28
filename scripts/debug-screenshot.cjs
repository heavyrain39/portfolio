const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
  await page.goto('http://localhost:3000/not-found');
  await page.waitForTimeout(5000); 

  // Try to find the h1 and its computed style
  const topTextVisible = await page.evaluate(() => {
     const h1 = document.querySelector('h1');
     if (!h1) return 'NO H1';
     const style = window.getComputedStyle(h1);
     return `color: ${style.color}, z-index: ${style.zIndex}, opacity: ${style.opacity}, visibility: ${style.visibility}, display: ${style.display}`;
  });
  console.log('Top Text CSS:', topTextVisible);

  await page.screenshot({ path: path.join(__dirname, '..', 'public', 'debug-full.png') });
  
  const h1Element = await page.$('h1');
  if (h1Element) {
    try {
      await h1Element.screenshot({ path: path.join(__dirname, '..', 'public', 'debug-h1.png') });
      console.log('H1 screenshot saved.');
    } catch(e) {
      console.log('H1 screenshot failed:', e.message);
    }
  }

  await browser.close();
})();
