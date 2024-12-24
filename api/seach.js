import scrapeFoodBasics from '../scraping.js';

export default async function handler(req, res) {
    const { query } = req.query;  // Get the search query from the URL
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const results = await scrapeFoodBasics(query);
        return res.status(200).json({ results });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
