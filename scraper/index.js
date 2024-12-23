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
            const productId = item.getAttribute('data-product-code') || 'N/A';
            const titleElement = document.querySelector(`#itemTitle-${productId}`);
            const visibleTitle = titleElement ? titleElement.innerText : name;
            const priceElement = item.querySelector('.pricing__sale-price .price-update');
            const price = priceElement ? priceElement.innerText.replace('$', '') : '0.00';
            const category = item.getAttribute('data-product-category') || 'Unknown category';

            if (category === "Fruits & Vegetables") {
                items.push({
                    name: visibleTitle,
                    price: price,
                    category,
                    store: 'Food Basics'
                });
            }
        });
        return items;
    });

    console.log(results);
    await browser.close();
}

async function scrapeWalmart(query) {
    const url = `https://www.walmart.ca/search?q=${query}`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.product-tile');

    const results = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.product-tile').forEach(item => {
            const nameElement = item.querySelector('.product-title') || {};
            const name = nameElement.innerText || 'No name';
            const priceElement = item.querySelector('.price') || {};
            const price = priceElement.innerText.replace('$', '') || '0.00';
            const category = 'General';

            items.push({
                name: name,
                price: price,
                category,
                store: 'Walmart'
            });
        });
        return items;
    });

    console.log(results);
    await browser.close();
}

async function handleScraping(query) {
    const store = document.getElementById('store').value;

    if (store === 'Foodbasics') {
        await scrapeFoodBasics(query);
    } else if (store === 'Walmart') {
        await scrapeWalmart(query);
    } else {
        console.error('Store not recognized');
    }
}

document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('itemName').value;
    handleScraping(query).catch(err => console.error("Error:", err));
});
