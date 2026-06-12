import React from 'react';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuote } from '../hooks/useQuote';
import PriceChart from './PriceChart';
import DividendTable from './DividendTable';
import './AssetDetail.css';

function fmt(n, d = 2) {
  if (n == null || isNaN(n)) return '--';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtB(n) {
  if (n == null || isNaN(n)) return '--';
  if (Math.abs(n) >= 1e9) return 'R$ ' + (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return 'R$ ' + (n / 1e6).toFixed(2) + 'M';
  return 'R$ ' + fmt(n);
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="sr-label">{label}</span>
      <span className="sr-value">{value}</span>
    </div>
  );
}

export default function AssetDetail({ ticker, onBack }) {
  const { quote, loading, error, refetch } = useQuote(ticker);
  const positive = (quote?.regularMarketChangePercent ?? 0) >= 0;

  if (loading) return (
    <div className="detail-loading">
      <div className="spinner" />
      <p>Carregando {ticker}...</p>
    </div>
  );

  if (error) return (
    <div className="detail-error">
      <p>{error}</p>
      <button onClick={refetch}>Tentar novamente</button>
    </div>
  );

  if (!quote) return null;

  return (
    <div className="asset-detail">
      <div className="detail-toolbar">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <button className="refresh-btn" onClick={refetch}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      <div className="detail-hero">
        <div>
          <h1 className="detail-ticker">{quote.symbol}</h1>
          <p className="detail-name">{quote.longName || quote.shortName}</p>
          <p className="detail-sector">{quote.sector} {quote.industry ? `· ${quote.industry}` : ''}</p>
        </div>

        <div className="detail-price-block">
          <div className="detail-price">R$ {fmt(quote.regularMarketPrice)}</div>
          <div className={`detail-change ${positive ? 'up' : 'down'}`}>
            {positive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {positive ? '+' : ''}{fmt(quote.regularMarketChangePercent)}%
            <span>({positive ? '+' : ''}R$ {fmt(quote.regularMarketChange)})</span>
          </div>
        </div>
      </div>

      <PriceChart ticker={ticker} currentPrice={quote.regularMarketPrice} />

      <div className="detail-grid">
        <div className="detail-section">
          <h3>Cotação</h3>
          <StatRow label="Abertura" value={`R$ ${fmt(quote.regularMarketOpen)}`} />
          <StatRow label="Fechamento anterior" value={`R$ ${fmt(quote.regularMarketPreviousClose)}`} />
          <StatRow label="Mínima do dia" value={`R$ ${fmt(quote.regularMarketDayLow)}`} />
          <StatRow label="Máxima do dia" value={`R$ ${fmt(quote.regularMarketDayHigh)}`} />
          <StatRow label="Volume" value={quote.regularMarketVolume != null ? (quote.regularMarketVolume / 1e6).toFixed(2) + 'M' : '--'} />
          <StatRow label="Mínima 52 semanas" value={`R$ ${fmt(quote.fiftyTwoWeekLow)}`} />
          <StatRow label="Máxima 52 semanas" value={`R$ ${fmt(quote.fiftyTwoWeekHigh)}`} />
        </div>

        <div className="detail-section">
          <h3>Fundamentos</h3>
          <StatRow label="P/L" value={fmt(quote.priceEarnings)} />
          <StatRow label="P/VP" value={fmt(quote.priceToBook)} />
          <StatRow label="EPS" value={quote.earningsPerShare != null ? `R$ ${fmt(quote.earningsPerShare)}` : '--'} />
          <StatRow label="Div. Yield" value={quote.dividendYield != null ? `${fmt(quote.dividendYield)}%` : '--'} />
          <StatRow label="Beta" value={fmt(quote.beta)} />
          <StatRow label="Valor de Mercado" value={fmtB(quote.marketCap)} />
          <StatRow label="Média Vol. 10d" value={quote.averageDailyVolume10Day != null ? (quote.averageDailyVolume10Day / 1e6).toFixed(2) + 'M' : '--'} />
        </div>
      </div>

      {quote.dividendsData?.cashDividends?.length > 0 && (
        <DividendTable dividends={quote.dividendsData.cashDividends} />
      )}
    </div>
  );
}
