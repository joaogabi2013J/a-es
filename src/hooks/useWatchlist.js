import { useState, useEffect } from 'react';
import { fetchMultipleQuotes } from '../api/brapi';

const STORAGE_KEY = 'b3_watchlist';
const DEFAULT_TICKERS = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'WEGE3', 'MGLU3', 'BBAS3', 'ABEV3'];

export function useWatchlist() {
  const [tickers, setTickers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TICKERS;
    } catch {
      return DEFAULT_TICKERS;
    }
  });

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  }, [tickers]);

  useEffect(() => {
    if (!tickers.length) { setQuotes([]); return; }
    setLoading(true);
    fetchMultipleQuotes(tickers)
      .then(data => setQuotes(data))
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, [tickers]);

  const addTicker = (ticker) => {
    const t = ticker.toUpperCase().trim();
    if (t && !tickers.includes(t)) setTickers(prev => [...prev, t]);
  };

  const removeTicker = (ticker) => {
    setTickers(prev => prev.filter(t => t !== ticker));
  };

  return { tickers, quotes, loading, addTicker, removeTicker };
}
