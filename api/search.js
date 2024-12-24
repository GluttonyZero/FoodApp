import puppeteer from 'puppeteer';

export default async function handler(req, res) {
    const query = req.query.query || 'apple';
    const url = `https://www.foodbasics.ca/search?filter=${query}`;

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
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

    // Generate HTML response
    let html = `<h1>Results for "${query}"</h1><ul>`;
    results.forEach(item => {
        html += `<li><strong>${item.name}</strong> - $${item.price.toFixed(2)} (${item.category})</li>`;
    });
    html += '</ul><a href="/">Search Again</a>';
    res.send(html);
}
