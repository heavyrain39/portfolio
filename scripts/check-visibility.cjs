const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
  await page.goto('http://localhost:3000/not-found');
  await page.waitForTimeout(3000); 

  const result = await page.evaluate(() => {
     const h1 = document.querySelector('h1');
     if (!h1) return 'NO H1';
     const rect = h1.getBoundingClientRect();
     if (rect.width === 0 || rect.height === 0) return 'H1 HAS ZERO DIMENSIONS';
     
     // Check if covered by getting element at center of h1
     const cx = rect.left + rect.width / 2;
     const cy = rect.top + rect.height / 2;
     const topEl = document.elementFromPoint(cx, cy);
     
     if (topEl === h1 || h1.contains(topEl)) return 'H1 is ON TOP - it matches elementFromPoint';
     return 'H1 is COVERED! The top element is: ' + topEl?.className + ' | Tag: ' + topEl?.tagName;
  });
  console.log('Result:', result);
  await browser.close();
})();
