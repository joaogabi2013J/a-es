import { useState, useEffect, useCallback } from 'react';
import { fetchQuote, fetchHistory } from '../api/brapi';

export function useQuote(ticker) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuote(ticker);
      setQuote(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => { load(); }, [load]);

  return { quote, loading, error, refetch: load };
}

export function useHistory(ticker, range) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    fetchHistory(ticker, range)
      .then(data => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [ticker, range]);

  return { history, loading };
}
