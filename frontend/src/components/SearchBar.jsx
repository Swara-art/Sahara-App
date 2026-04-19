import { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(query.trim());
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, onSearch]);

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search nearby complaints…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button className="search-clear" onClick={() => setQuery('')} title="Clear">
          ✕
        </button>
      )}
    </div>
  );
}
