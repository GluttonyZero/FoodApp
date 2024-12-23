<?php
if (isset($_GET['q'])) {
    $query = urlencode($_GET['q']);
    $url = "https://www.foodbasics.ca/search?filter=$query";
    
    // Fetch HTML content
    $html = file_get_contents($url);
    
    // Parse HTML with DOMDocument
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($html);
    
    $xpath = new DOMXPath($dom);
    
    // Extract product data
    $products = [];
    $productTiles = $xpath->query("//div[contains(@class, 'default-product-tile')]");
    
    foreach ($productTiles as $tile) {
        $name = $tile->getAttribute('data-product-name') ?: 'No name';
        $priceNode = $xpath->query(".//span[contains(@class, 'price-update')]", $tile);
        $price = $priceNode->length ? $priceNode[0]->textContent : '0.00';
        
        $products[] = [
            'name' => $name,
            'price' => $price
        ];
    }
    
    // Return as JSON
    header('Content-Type: application/json');
    echo json_encode(['products' => $products]);
} else {
    echo json_encode(['error' => 'No query provided']);
}
?>
