const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const testFilePath = 'file://' + path.resolve(__dirname, 'engine-test-111.html');
  console.log('Opening test page:', testFilePath);
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto(testFilePath);

  // ABTQuickScan 완료 대기
  await page.waitForFunction(() => window.testComplete === true, { timeout: 5000 });

  // 결과 수집
  const reports = await page.evaluate(() => window.testReports);
  
  console.log('\n--- Test Results Verification ---');
  reports.forEach((report, index) => {
    console.log(`[Result ${index + 1}] Selector: ${report.elementInfo.selector}`);
    console.log(`Status: ${report.result.status}`);
    console.log(`Message: ${report.result.message}`);
    console.log('----------------------------------');
  });

  // 스크린샷 저장 (시각적 확인용)
  await page.screenshot({ path: path.resolve(__dirname, 'test-result-111.png'), fullPage: true });
  console.log('\nScreenshot saved to tests/test-result-111.png');

  await browser.close();
})();
