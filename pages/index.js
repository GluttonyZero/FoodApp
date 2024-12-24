import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setResults(data.data || []);
      setLoading(false);
    } catch (err) {
      setError('An error occurred while scraping.');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.location.href = '/scraped_results.csv';
  };

  return (
    <div>
      <h1>Food Basics Scraper</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Scraping...' : 'Search'}
        </button>
      </form>

      {error && <p>{error}</p>}

      {results.length > 0 && (
        <div>
          <h2>Results</h2>
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
              {results.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>{item.category}</td>
                  <td>{item.store}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleDownload}>Download CSV</button>
        </div>
      )}
    </div>
  );
}
