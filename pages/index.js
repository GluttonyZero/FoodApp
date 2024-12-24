import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [scrapeData, setScrapeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error('Failed to scrape');
      }

      const data = await res.json();

      if (data.message === 'Scraping complete') {
        alert('Scraping complete!');
        fetchCsvData(); // Once scraping is complete, fetch the CSV data
      }
    } catch (err) {
      setError('An error occurred while scraping.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCsvData = async () => {
    try {
      const res = await fetch('/scrapedData.csv');
      if (!res.ok) {
        throw new Error('Failed to fetch CSV');
      }

      const text = await res.text();
      const parsedData = parseCSV(text);
      setScrapeData(parsedData);
    } catch (err) {
      setError('An error occurred while fetching the CSV data.');
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');  // Header row
    const rows = lines.slice(1); // Data rows

    return rows.map(row => {
      const values = row.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index].trim();
      });
      return obj;
    });
  };

  return (
    <div>
      <h1>Food Basics Scraper</h1>
      
      <input
        type="text"
        placeholder="Enter product name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleScrape} disabled={loading}>
        {loading ? 'Scraping...' : 'Scrape'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {scrapeData && (
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
            {scrapeData.map((item, index) => (
              <tr key={index}>
                <td>{item.Name}</td>
                <td>{item.Price}</td>
                <td>{item.Category}</td>
                <td>{item.Store}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
