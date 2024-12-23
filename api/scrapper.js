import puppeteer from 'puppeteer';
import express from 'express';
import cors from 'cors';  // To handle cross-origin requests

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  // Enable CORS for frontend to backend communication

// Scraping FoodBasics
async function scrapeFoodBasics(query) {
    const url = `https://www.foodbasics.ca/search?filter=${query}`;
    const browser = await puppeteer.launch({ headless: true });
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

// Scraping Walmart
async function scrapeWalmart(query) {
    const url = `https://www.walmart.ca/search?q=${query}`;
    const browser = await puppeteer.launch({ headless: true });
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

// API Endpoint
app.get('/api/scraper', async (req, res) => {
    const { item, store } = req.query;
    let results = [];

    if (store === 'FoodBasics') {
        results = await scrapeFoodBasics(item);
    } else if (store === 'Walmart') {
        results = await scrapeWalmart(item);
    } else {
        return res.status(400).json({ error: 'Invalid store' });
    }

    res.json(results);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
