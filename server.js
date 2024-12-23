const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/scrape', async (req, res) => {
    const { query } = req.body;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Example scraping site (replace with actual URLs)
    const url = `https://www.foodbasics.ca/search?filter=${encodeURIComponent(query)}`;
    await page.goto(url);
    
    const items = await page.evaluate(() => {
        const products = [];
        document.querySelectorAll('.product-item').forEach(item => {
            const name = item.querySelector('.product-title').innerText;
            const price = item.querySelector('.product-price').innerText.replace('$', '');
            products.push({ name, price });
        });
        return products;
    });

    await browser.close();
    res.json({ query, items });
});

app.listen(3000, () => {
    console.log('Server running on food-app-git-main-sivans-projects-6978c357.vercel.app');
});
