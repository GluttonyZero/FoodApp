import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Simple API route for testing
app.get('/api/scraper', (req, res) => {
    res.json({ message: 'Scraper API is working!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
