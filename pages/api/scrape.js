import puppeteer from 'puppeteer-core'; // Use puppeteer-core with chrome-aws-lambda
import chrome from 'chrome-aws-lambda';
import fs from 'fs';
import path from 'path';

async function scrapeFoodBasics(query) {
  const url = `https://www.foodbasics.ca/search?filter=${query}`;
  
  const browser = await puppeteer.launch({
    args: [...chrome.args, '--disable-dev-shm-usage'],
    executablePath: await chrome.executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  // Go to the URL
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for product tiles to load
  await page.waitForSelector('.default-product-tile');

  // Extract product data
  const results = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.default-product-tile').forEach(item => {
      const name = item.getAttribute('data-product-name') || 'No name';
      const productId = item.getAttribute('data-product-code') || 'N/A';
      
      // Get visible product title if available
      const titleElement = document.querySelector(`#itemTitle-${productId}`);
      const visibleTitle = titleElement ? titleElement.innerText : name;
      
      // Extract price from .pricing__sale-price
      const priceElement = item.querySelector('.pricing__sale-price .price-update');
      const price = priceElement ? priceElement.innerText.replace('$', '') : '0.00';

      const category = item.getAttribute('data-product-category') || 'Unknown category';
      
      items.push({
        name: visibleTitle,
        price: parseFloat(price),
        category,
        store: 'Food Basics'
      });
    });
    return items;
  });

  await browser.close();
  return results;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
      const results = await scrapeFoodBasics(query);

      // Write results to CSV
      const filePath = path.join(process.cwd(), 'public', 'scraped_results.csv');
      const csvData = 'Name,Price,Category,Store\n' +
        results.map(item => `${item.name},${item.price},${item.category},${item.store}`).join('\n');
        
      fs.writeFileSync(filePath, csvData);

      res.status(200).json({ message: 'Scraping complete', data: results });
    } catch (error) {
      console.error('Scraping failed:', error);
      res.status(500).json({ error: 'An error occurred while scraping' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
