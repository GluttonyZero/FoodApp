import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [scrapeData, setScrapeData] = useState(null);
  
  const handleScrape = async () => {
    // Send a POST request to the scraping API
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await res.json();
    if (data.message === 'Scraping complete') {
      alert('Scraping complete!');
      fetchCsvData();  // Once scraping is complete, fetch the CSV data
    }
  };

  const fetchCsvData = async () => {
    const res = await fetch('/scrapedData.csv');
    const text = await res.text();
    const parsedData = parseCSV(text);
    setScrapeData(parsedData);
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
      <button onClick={handleScrape}>Scrape</button>

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
