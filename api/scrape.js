import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

async function scrapeFoodBasics(query) {
    const url = `https://www.foodbasics.ca/search?filter=${query}`;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.default-product-tile');

    const results = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.default-product-tile').forEach(item => {
            const name = item.getAttribute('data-product-name') || 'No name';
            const priceElement = item.querySelector('.pricing__sale-price .price-update');
            const price = priceElement ? priceElement.innerText.replace('$', '') : '0.00';
            const category = item.getAttribute('data-product-category') || 'Unknown category';

            items.push({ name, price: parseFloat(price), category });
        });
        return items;
    });

    await browser.close();
    return results;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { food } = req.body;

        try {
            // Scrape the food item
            const scrapedData = await scrapeFoodBasics(food);

            // Save results to a JSON file
            const jsonFilePath = path.resolve('./data/results.json');
            const existingData = fs.existsSync(jsonFilePath) ? JSON.parse(fs.readFileSync(jsonFilePath)) : [];
            existingData.push(...scrapedData);

            fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2));

            // Respond with the scraped data
            return res.status(200).json({ results: scrapedData });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
