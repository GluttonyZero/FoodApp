const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Middleware to parse form data and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));  // Serving static files (like HTML) from 'public' directory

// Scrape function using Puppeteer
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

    await browser.close();
    return results;
}

// Serve the HTML form (client-side)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API endpoint to trigger the scraping process
app.post('/scrape', async (req, res) => {
    const query = req.body.query;
    try {
        const data = await scrapeFoodBasics(query);
        res.json(data); // Send the scraped data back to the client as JSON
    } catch (err) {
        res.status(500).send("Error scraping data");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
