import chromium from 'chrome-aws-lambda';

export default async function handler(req, res) {
    const query = req.query.query || 'apple'; // Default query is 'apple' if no query is provided
    const url = `https://www.foodbasics.ca/search?filter=${query}`;
    
    let browser = null;
    try {
        // Launch Puppeteer with chrome-aws-lambda configurations
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for product tiles to load
        await page.waitForSelector('.default-product-tile');

        // Extract product data
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

        // Close the browser after scraping
        await browser.close();

        // Format results into HTML
        let html = `<h1>Results for "${query}"</h1><ul>`;
        results.forEach(item => {
            html += `<li><strong>${item.name}</strong> - $${item.price.toFixed(2)} (${item.category})</li>`;
        });
        html += '</ul><a href="/">Search Again</a>';
        
        // Return the results in HTML
        res.send(html);

    } catch (error) {
        console.error('Error scraping:', error);
        res.status(500).send(`<h1>Scraping Failed</h1><p>${error.message}</p>`);
        
        if (browser !== null) {
            await browser.close();
        }
    }
}
