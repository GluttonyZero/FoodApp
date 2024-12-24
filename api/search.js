import puppeteer from 'puppeteer';
import fs from 'fs/promises';

export default async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Missing query parameter" });
    }

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

            items.push({
                name,
                price,
                store: 'Food Basics'
            });
        });
        return items;
    });

    await browser.close();

    await fs.writeFile('./public/results.json', JSON.stringify(results, null, 2));
    res.status(200).json(results);
};
