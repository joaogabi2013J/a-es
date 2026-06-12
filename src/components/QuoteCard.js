import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import './QuoteCard.css';

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return '--';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtCurrency(n) {
  if (n == null || isNaN(n)) return '--';
  return 'R$ ' + fmt(n);
}

export default function QuoteCard({ quote, onClick, onRemove }) {
  if (!quote) return null;

  const positive = (quote.regularMarketChangePercent ?? 0) >= 0;

  return (
    <div className="quote-card" onClick={() => onClick?.(quote.symbol)}>
      <div className="qc-header">
        <div>
          <span className="qc-ticker">{quote.symbol}</span>
          <span className="qc-name">{quote.shortName?.substring(0, 22) ?? ''}</span>
        </div>
        {onRemove && (
          <button
            className="qc-remove"
            onClick={e => { e.stopPropagation(); onRemove(quote.symbol); }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="qc-price">{fmtCurrency(quote.regularMarketPrice)}</div>

      <div className={`qc-change ${positive ? 'up' : 'down'}`}>
        {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{positive ? '+' : ''}{fmt(quote.regularMarketChangePercent)}%</span>
        <span className="qc-change-abs">
          ({positive ? '+' : ''}{fmtCurrency(quote.regularMarketChange)})
        </span>
      </div>

      <div className="qc-stats">
        <div className="qc-stat">
          <span>Min</span><span>{fmtCurrency(quote.regularMarketDayLow)}</span>
        </div>
        <div className="qc-stat">
          <span>Max</span><span>{fmtCurrency(quote.regularMarketDayHigh)}</span>
        </div>
        <div className="qc-stat">
          <span>Vol</span>
          <span>{quote.regularMarketVolume != null
            ? (quote.regularMarketVolume / 1e6).toFixed(1) + 'M'
            : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
