import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader } from 'lucide-react';
import { fetchAvailableTickers, fetchMultipleQuotes } from '../api/brapi';
import QuoteCard from './QuoteCard';
import './ExploreView.css';

const SEGMENTS = ['Todos', 'Ações', 'FII', 'BDR', 'ETF'];

export default function ExploreView({ onSelectTicker }) {
  const [tickers, setTickers] = useState([]);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('Todos');
  const [quotes, setQuotes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    fetchAvailableTickers()
      .then(data => setTickers(data))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  const filtered = tickers
    .filter(t => {
      const sym = t.stock || t;
      const q = search.toUpperCase();
      if (q && !sym.includes(q)) return false;
      if (segment === 'FII') return sym.endsWith('11');
      if (segment === 'BDR') return sym.endsWith('34') || sym.endsWith('32') || sym.endsWith('33') || sym.endsWith('35');
      if (segment === 'ETF') return ['BOVA11','SMAL11','IVVB11','HASH11','SPXI11'].includes(sym);
      if (segment === 'Ações') return !sym.endsWith('11') && !sym.endsWith('34');
      return true;
    })
    .slice(0, 100);

  const handleSearch = useCallback((items) => {
    if (!items.length) return;
    const syms = items.slice(0, 20).map(t => t.stock || t);
    setLoadingQuotes(true);
    fetchMultipleQuotes(syms)
      .then(data => setQuotes(data))
      .catch(() => {})
      .finally(() => setLoadingQuotes(false));
  }, []);

  useEffect(() => {
    if (search.length > 0) {
      const t = setTimeout(() => handleSearch(filtered), 500);
      return () => clearTimeout(t);
    }
  }, [search, filtered, handleSearch]);

  return (
    <div className="explore-view">
      <div className="ev-header">
        <h2>Explorar Ativos B3</h2>
        <p>{tickers.length > 0 ? `${tickers.length} ativos disponíveis` : 'Carregando ativos...'}</p>
      </div>

      <div className="ev-controls">
        <div className="ev-search-wrap">
          <Search size={16} className="ev-search-icon" />
          <input
            className="ev-search"
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
            placeholder="Buscar ativo... (PETR4, VALE3...)"
          />
          {loadingQuotes && <Loader size={16} className="spin ev-loader" />}
        </div>

        <div className="ev-segments">
          {SEGMENTS.map(s => (
            <button
              key={s}
              className={`ev-seg-btn ${segment === s ? 'active' : ''}`}
              onClick={() => setSegment(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loadingList ? (
        <div className="ev-loading">Carregando lista de ativos...</div>
      ) : search && quotes.length > 0 ? (
        <div className="ev-grid">
          {quotes.map(q => (
            <QuoteCard key={q.symbol} quote={q} onClick={onSelectTicker} />
          ))}
        </div>
      ) : (
        <div className="ev-ticker-list">
          {filtered.slice(0, 60).map(t => {
            const sym = t.stock || t;
            return (
              <button key={sym} className="ev-ticker-chip" onClick={() => onSelectTicker(sym)}>
                {sym}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
