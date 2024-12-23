import { useState } from 'react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent form from refreshing the page
        setLoading(true);

        // Send the query to the backend API (scrape.js)
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();
        setResults(data.results || []);
        setLoading(false);
    };

    return (
        <div>
            <h1>Search Products on Food Basics</h1>

            {/* Search form */}
            <form onSubmit={handleSubmit}>
                <label htmlFor="query">Enter a product name:</label>
                <input
                    type="text"
                    id="query"
                    name="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <hr />

            {/* Displaying search results */}
            {results.length > 0 && !loading && (
                <div>
                    <h2>Search Results for "{query}"</h2>
                    <ul>
                        {results.map((item, index) => (
                            <li key={index}>
                                <strong>Name:</strong> {item.name} <br />
                                <strong>Price:</strong> ${item.price} <br />
                                <strong>Category:</strong> {item.category} <br />
                                <strong>Store:</strong> {item.store}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Message if no results found */}
            {results.length === 0 && !loading && query && (
                <p>No products found. Try a different search!</p>
            )}
        </div>
    );
}
