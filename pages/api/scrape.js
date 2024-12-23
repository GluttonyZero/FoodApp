import { scrapeFoodBasics, generateHTML } from '../../lib/scraper';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { query } = req.body;

        try {
            const results = await scrapeFoodBasics(query);
            const htmlContent = generateHTML(results);
            res.status(200).send(htmlContent); // Send HTML as response
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error scraping data' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
