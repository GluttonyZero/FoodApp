import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function scrapeFoodBasics(query) {
  const url = `https://www.foodbasics.ca/search?filter=${query}`;

  const browser = await puppeteer.launch({ headless: true });
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

  // Store results temporarily in the /tmp directory (Vercel's ephemeral filesystem)
  const tempFilePath = path.join('/tmp', `${query}_results.json`);
  fs.writeFileSync(tempFilePath, JSON.stringify(results, null, 2));

  console.log('Data saved to temporary JSON file:', tempFilePath);

  await browser.close();
  return results;
}

export default async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'query' is required." });
  }

  try {
    const data = await scrapeFoodBasics(query);  // Scrape data
    return res.status(200).json(data);  // Return results as JSON
  } catch (error) {
    return res.status(500).json({ error: error.message });  // Handle errors
  }
};
