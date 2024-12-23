import puppeteer from 'puppeteer';

export async function scrapeFoodBasics(query) {
    const url = `https://www.foodbasics.ca/search?filter=${query}`;

    const browser = await puppeteer.launch({
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Go to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for product tiles to load
    await page.waitForSelector('.default-product-tile');

    // Extract product data
    const results = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.default-product-tile').forEach(item => {
            const name = item.getAttribute('data-product-name') || 'No name';
            const productId = item.getAttribute('data-product-code') || 'N/A';
            
            // Get visible product title if available
            const titleElement = document.querySelector(`#itemTitle-${productId}`);
            const visibleTitle = titleElement ? titleElement.innerText : name;
            
            // Extract price from .pricing__sale-price
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

export function generateHTML(results) {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Scrape Results</title>
        <link rel="stylesheet" href="/styles/style.css">
    </head>
    <body>
        <h1>Scrape Results from FoodBasics</h1>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Store</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(item => {
        html += `
        <tr>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>${item.category}</td>
            <td>${item.store}</td>
        </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    </body>
    </html>
    `;

    return html;
}
