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
    console.log(items);  // Add logging to check what data you're getting
    return items;
});
