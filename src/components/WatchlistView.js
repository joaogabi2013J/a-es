import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import QuoteCard from './QuoteCard';
import { useWatchlist } from '../hooks/useWatchlist';
import './WatchlistView.css';

export default function WatchlistView({ onSelectTicker }) {
  const { quotes, loading, addTicker, removeTicker } = useWatchlist();
  const [input, setInput] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) { addTicker(input.trim()); setInput(''); }
  };

  return (
    <div className="watchlist-view">
      <div className="wv-header">
        <div>
          <h2>Minha Watchlist</h2>
          <p>Acompanhe seus ativos favoritos</p>
        </div>
        <form className="wv-add-form" onSubmit={handleAdd}>
          <input
            className="wv-input"
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            placeholder="Ex: PETR4"
            maxLength={10}
          />
          <button type="submit" className="wv-add-btn">
            <Plus size={18} />
          </button>
        </form>
      </div>

      {loading && (
        <div className="wv-loading">
          <RefreshCw size={20} className="spin" />
          <span>Atualizando cotações...</span>
        </div>
      )}

      <div className="wv-grid">
        {quotes.map(q => (
          <QuoteCard
            key={q.symbol}
            quote={q}
            onClick={onSelectTicker}
            onRemove={removeTicker}
          />
        ))}
      </div>
    </div>
  );
}
