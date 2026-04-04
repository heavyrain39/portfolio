const { chromium } = require('playwright');
const path = require('path');
const { execSync } = require('child_process');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the main portfolio page with 1.5x resolution
  const captureWidth = 1800;
  const captureHeight = 945;
  const targetWidth = 1200;
  const targetHeight = 630;

  console.log(`Navigating to http://localhost:3000/portfolio/ at ${captureWidth}x${captureHeight}...`);
  await page.setViewportSize({ width: captureWidth, height: captureHeight });
  await page.goto('http://localhost:3000/portfolio/', { waitUntil: 'networkidle' });
  
  // Wait for Hero section animations and the shooting minigame's enemies to appear
  console.log('Waiting 10 seconds for enemies in the minigame to appear...');
  await page.waitForTimeout(10000);
  
  // Take high-res temporary screenshot
  const tempPath = path.resolve(__dirname, '../public/images/temp-og.jpg');
  const finalPath = path.resolve(__dirname, '../public/images/og-image.jpg');

  await page.screenshot({ 
    path: tempPath,
    type: 'jpeg',
    quality: 100 
  });
  
  console.log(`High-res capture saved to: ${tempPath}`);

  // Use ffmpeg to resize down to target size
  console.log(`Downscaling to ${targetWidth}x${targetHeight}...`);
  try {
    execSync(`ffmpeg -y -i "${tempPath}" -vf scale=${targetWidth}:${targetHeight} -q:v 2 "${finalPath}"`);
    console.log(`Final OG Image saved to: ${finalPath}`);
  } catch (error) {
    console.error('Failed to resize with ffmpeg:', error);
  }
  
  await browser.close();
})();
