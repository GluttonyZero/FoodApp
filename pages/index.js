import { useState } from 'react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (res.ok) {
            const html = await res.text();
            setResults(html); // Set the HTML result to be displayed
        } else {
            setResults('<p>No results found.</p>');
        }
    };

    return (
        <div>
            <h1>Food Basics Scraper</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for products"
                    required
                />
                <button type="submit">Scrape</button>
            </form>

            <div dangerouslySetInnerHTML={{ __html: results }} />
        </div>
    );
}
