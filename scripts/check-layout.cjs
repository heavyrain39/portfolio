const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
  await page.goto('http://localhost:3000/not-found');
  await page.waitForTimeout(3000); 
  
  const layout = await page.evaluate(() => {
    let circleElement = null;
    const divs = Array.from(document.querySelectorAll('div'));
    for (let d of divs) {
        if (d.style && d.style.boxShadow && d.style.boxShadow.includes('200vmax')) {
            circleElement = d.parentElement;
            break;
        }
    }
    
    return {
      title: document.querySelector('h1') ? document.querySelector('h1').getBoundingClientRect().toJSON() : null,
      circle: circleElement ? circleElement.getBoundingClientRect().toJSON() : null,
      quote: document.querySelector('p') ? document.querySelector('p').getBoundingClientRect().toJSON() : null,
      container: document.querySelector('h1') ? document.querySelector('h1').parentElement.parentElement.getBoundingClientRect().toJSON() : null
    };
  });
  console.log(JSON.stringify(layout, null, 2));
  await browser.close();
})();
