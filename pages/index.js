import { useState } from 'react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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

            {results.length > 0 && (
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

            {results.length === 0 && !loading && query && (
                <p>No products found. Try a different search!</p>
            )}
        </div>
    );
}
