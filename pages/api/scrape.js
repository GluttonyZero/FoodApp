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
            
            const titleElement = document.querySelector(`#itemTitle-${productId}`);
            const visibleTitle = titleElement ? titleElement.innerText : name;
            
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

    // Write results to a CSV file
    const csvFilePath = path.join(process.cwd(), 'public', 'scrapedData.csv');
    const csvHeader = 'Name, Price, Category, Store\n';
    const csvRows = results.map(item => `${item.name}, ${item.price}, ${item.category}, ${item.store}`).join('\n');
    const csvContent = csvHeader + csvRows;

    fs.writeFileSync(csvFilePath, csvContent, 'utf8');

    await browser.close();
    return results;
}

// API route handler
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { query } = req.body; // Get the query from the request
        const results = await scrapeFoodBasics(query);
        res.status(200).json({ message: 'Scraping complete', data: results });
    } else {
        res.status(400).json({ error: 'Invalid request method' });
    }
}
