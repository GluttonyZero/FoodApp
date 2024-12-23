import puppeteer from 'puppeteer';

// Scraper function for FoodBasics
async function scrapeFoodBasics(query) {
    const url = `https://www.foodbasics.ca/search?filter=${query}`;
    const browser = await puppeteer.launch({ headless: false });
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

    console.log(results);
    await browser.close();
}

// Scraper function for Walmart
async function scrapeWalmart(query) {
    const url = `https://www.walmart.ca/search?q=${query}`;
    const browser = await puppeteer.launch({ headless: false });
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

    console.log(results);
    await browser.close();
}

// Main Function - Call appropriate scraper based on input
(async () => {
    const args = process.argv.slice(2); // Read from command line
    const query = args[0];
    const store = args[1];

    if (!query || !store) {
        console.error('Usage: node scraper.js <item> <store>');
        process.exit(1);
    }

    if (store.toLowerCase() === 'foodbasics') {
        await scrapeFoodBasics(query);
    } else if (store.toLowerCase() === 'walmart') {
        await scrapeWalmart(query);
    } else {
        console.error('Store not recognized.');
    }
})();
