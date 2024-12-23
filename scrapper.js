// External scraper.js hosted on your website

async function scrape(item, store) {
    let results = [];

    if (store === 'Foodbasics') {
        results = await scrapeFoodBasics(item);
    } else if (store === 'Walmart') {
        results = await scrapeWalmart(item);
    } else {
        throw new Error('Invalid store');
    }

    return results;
}

// Scraping for Food Basics
async function scrapeFoodBasics(query) {
    const url = `https://www.foodbasics.ca/search?filter=${query}`;

    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const items = [];
    doc.querySelectorAll('.default-product-tile').forEach(item => {
        const name = item.getAttribute('data-product-name') || 'No name';
        const priceElement = item.querySelector('.pricing__sale-price .price-update');
        const price = priceElement ? priceElement.innerText.replace('$', '') : '0.00';
        items.push({ name, price, store: 'FoodBasics' });
    });

    return items;
}

// Scraping for Walmart
async function scrapeWalmart(query) {
    const url = `https://www.walmart.ca/search?q=${query}`;

    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const items = [];
    doc.querySelectorAll('.product-tile').forEach(item => {
        const name = item.querySelector('.product-title')?.innerText || 'No name';
        const priceElement = item.querySelector('.price');
        const price = priceElement ? priceElement.innerText.replace('$', '') : '0.00';
        items.push({ name, price, store: 'Walmart' });
    });

    return items;
}
