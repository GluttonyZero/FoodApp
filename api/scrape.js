import puppeteer from 'puppeteer';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const query = req.body.query;

        try {
            const results = await scrapeFoodBasics(query);
            res.status(200).send(`
                <h1>Search Results for "${query}"</h1>
                <ul>
                    ${results.map(item => `
                        <li>
                            <strong>Name:</strong> ${item.name}<br>
                            <strong>Price:</strong> $${item.price}<br>
                            <strong>Category:</strong> ${item.category}<br>
                            <strong>Store:</strong> ${item.store}
                        </li>
                    `).join('')}
                </ul>
                <hr>
                <a href="/">Back to Search</a>
            `);
        } catch (err) {
            res.status(500).send(`<h1>Error: ${err.message}</h1>`);
        }
    } else {
        res.status(405).send({ message: 'Only POST method is allowed' });
    }
}

// Function to scrape Food Basics
async function scrapeFoodBasics(query) {
    const url = `https://www.foodbasics.ca/search?filter=${query}`;
    const browser = await puppeteer.launch({ headless: true });
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
