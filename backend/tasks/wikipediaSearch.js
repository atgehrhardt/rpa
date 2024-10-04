const { chromium } = require('playwright');
const path = require('path');

module.exports = {
  name: 'Wikipedia Search and Screenshot',
  description: 'Searches Wikipedia for a user-provided term and takes a screenshot of the results',
  promptConfig: [
    {
      name: 'searchTerm',
      type: 'shortAnswer',
      label: 'Enter a search term for Wikipedia:',
    },
  ],
  run: async (log, _, promptData) => {
    if (!promptData || !promptData.searchTerm) {
      throw new Error("No search term provided");
    }

    const searchTerm = promptData.searchTerm;
    log(`User entered search term: ${searchTerm}`);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      log('Navigating to Wikipedia');
      await page.goto('https://www.wikipedia.org/');

      log(`Searching for: ${searchTerm}`);
      await page.fill('input[name="search"]', searchTerm);
      await page.click('button[type="submit"]');

      log('Waiting for search results to load');
      await page.waitForLoadState('networkidle');

      log('Taking screenshot of search results');
      const screenshotPath = path.join(__dirname, 'downloads', `wikipedia_${searchTerm.replace(/\s+/g, '_')}_${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      log(`Screenshot saved at: ${screenshotPath}`);

      return path.basename(screenshotPath);
    } catch (error) {
      log(`Error during Wikipedia search: ${error.message}`);
      throw error;
    } finally {
      await browser.close();
    }
  }
};