import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchMultipleQuotes } from '../api/brapi';
import QuoteCard from './QuoteCard';
import './MarketView.css';

const INDICES = ['IBOV', 'IFIX', 'SMLL'];
const TOP_STOCKS = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'WEGE3', 'RENT3', 'ABEV3', 'BBAS3', 'MGLU3', 'SUZB3', 'ELET3', 'RADL3'];

export default function MarketView({ onSelectTicker }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = () => {
    setLoading(true);
    fetchMultipleQuotes(TOP_STOCKS)
      .then(data => { setStocks(data); setLastUpdate(new Date()); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const gainers = [...stocks].sort((a, b) => (b.regularMarketChangePercent ?? 0) - (a.regularMarketChangePercent ?? 0)).slice(0, 5);
  const losers = [...stocks].sort((a, b) => (a.regularMarketChangePercent ?? 0) - (b.regularMarketChangePercent ?? 0)).slice(0, 5);

  return (
    <div className="market-view">
      <div className="mv-header">
        <div>
          <h2>Visão de Mercado</h2>
          {lastUpdate && (
            <p>Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          )}
        </div>
        <button className={`mv-refresh ${loading ? 'loading' : ''}`} onClick={load}>
          <RefreshCw size={16} />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="mv-section">
        <h3>Maiores Altas</h3>
        <div className="mv-grid">
          {gainers.map(q => (
            <QuoteCard key={q.symbol} quote={q} onClick={onSelectTicker} />
          ))}
        </div>
      </div>

      <div className="mv-section">
        <h3>Maiores Baixas</h3>
        <div className="mv-grid">
          {losers.map(q => (
            <QuoteCard key={q.symbol} quote={q} onClick={onSelectTicker} />
          ))}
        </div>
      </div>

      <div className="mv-section">
        <h3>Todos os Ativos Monitorados</h3>
        <div className="mv-grid full">
          {stocks.map(q => (
            <QuoteCard key={q.symbol} quote={q} onClick={onSelectTicker} />
          ))}
        </div>
      </div>
    </div>
  );
}
