import puppeteer from 'puppeteer';

export default async function handler(req, res) {
    const { item, store } = req.query;

    if (!item || !store) {
        return res.status(400).json({ error: 'Item and store are required' });
    }

    try {
        let results = [];

        // Scraping logic for different stores
        if (store === 'FoodBasics') {
            results = await scrapeFoodBasics(item);
        } else if (store === 'Walmart') {
            results = await scrapeWalmart(item);
        } else {
            return res.status(400).json({ error: 'Invalid store' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No results found' });
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Failed to scrape: ${error.message}` });
    }
}

// Scraping function for FoodBasics
async function scrapeFoodBasics(query) {
    const url = `https://www.foodbasics.ca/search?filter=${query}`;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Ensure it works in serverless environments
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const results = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.default-product-tile').forEach(item => {
            const name = item.getAttribute('data-product-name') || 'No name';
            const priceElement = item.querySelector('.pricing__sale-price .price-update');
            const price = priceElement ? priceElement.innerText.replace('$', '') : '0.00';
            items.push({ name, price, store: 'FoodBasics' });
        });
        return items;
    });

    await browser.close();
    return results;
}

// Scraping function for Walmart
async function scrapeWalmart(query) {
    const url = `https://www.walmart.ca/search?q=${query}`;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Ensure it works in serverless environments
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const results = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.product-tile').forEach(item => {
            const name = item.querySelector('.product-title')?.innerText || 'No name';
            const priceElement = item.querySelector('.price');
            const price = priceElement ? priceElement.innerText.replace('$', '') : '0.00';
            items.push({ name, price, store: 'Walmart' });
        });
        return items;
    });

    await browser.close();
    return results;
}
