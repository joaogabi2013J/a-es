// Lê dados pré-carregados pelo GitHub Actions (sem CORS, sem chave)
// Arquivo gerado em: public/data/quotes.json

const BASE = process.env.PUBLIC_URL || '';

let cachedQuotes = null;
let cacheTime = 0;

async function getAll() {
  if (cachedQuotes && Date.now() - cacheTime < 5 * 60 * 1000) return cachedQuotes;
  const res = await fetch(`${BASE}/data/quotes.json?t=${Math.floor(Date.now() / 60000)}`);
  if (!res.ok) throw new Error('Dados não disponíveis. Tente novamente em instantes.');
  cachedQuotes = await res.json();
  cacheTime = Date.now();
  return cachedQuotes;
}

function toNormalized(q) {
  if (!q || !q.regularMarketPrice) return null;
  return {
    symbol: q.symbol,
    shortName: q.shortName || q.symbol,
    longName: q.shortName || q.symbol,
    sector: q.sector || '',
    industry: q.industry || '',
    regularMarketPrice: q.regularMarketPrice,
    regularMarketChange: q.regularMarketChange,
    regularMarketChangePercent: q.regularMarketChangePercent,
    regularMarketDayHigh: q.regularMarketDayHigh,
    regularMarketDayLow: q.regularMarketDayLow,
    regularMarketVolume: q.regularMarketVolume,
    regularMarketOpen: q.regularMarketOpen,
    regularMarketPreviousClose: q.regularMarketPreviousClose || null,
    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh || null,
    fiftyTwoWeekLow: q.fiftyTwoWeekLow || null,
    marketCap: q.marketCap || null,
    priceEarnings: q.priceEarnings || null,
    priceToBook: q.priceToBook || null,
    dividendYield: q.dividendYield || null,
    beta: q.beta || null,
    earningsPerShare: q.earningsPerShare || null,
    averageDailyVolume10Day: q.averageDailyVolume10Day || null,
    dividendsData: null,
    updatedAt: q.date || null,
  };
}

export async function fetchMultipleQuotes(tickers) {
  const all = await getAll();
  return tickers.map(t => toNormalized(all[t.toUpperCase()])).filter(Boolean);
}

export async function fetchQuote(ticker) {
  const all = await getAll();
  const q = toNormalized(all[ticker.toUpperCase()]);
  if (!q) throw new Error(`${ticker} não encontrado nos dados`);

  // Tenta enriquecer com histórico pré-carregado (52wk, prev close)
  try {
    const hist = await fetchHistory(ticker, '1y');
    if (hist.length >= 2) {
      const sorted = [...hist].sort((a, b) => a.date - b.date);
      const prev = sorted[sorted.length - 2]?.close;
      const closes = sorted.map(h => h.close).filter(Boolean);
      if (prev) {
        q.regularMarketPreviousClose = prev;
        q.regularMarketChange = q.regularMarketPrice - prev;
        q.regularMarketChangePercent = ((q.regularMarketPrice - prev) / prev) * 100;
      }
      if (closes.length) {
        q.fiftyTwoWeekHigh = Math.max(...closes);
        q.fiftyTwoWeekLow = Math.min(...closes);
      }
    }
  } catch (_) {}

  return q;
}

export async function fetchHistory(ticker, range = '1mo') {
  // Tenta arquivo de histórico pré-carregado
  try {
    const res = await fetch(`${BASE}/data/history/${ticker.toUpperCase()}.json`);
    if (res.ok) {
      const hist = await res.json();
      const days = { '5d': 7, '1mo': 35, '3mo': 95, '6mo': 185, '1y': 365 }[range] ?? 35;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return hist
        .filter(h => new Date(h.date) >= cutoff)
        .map(h => ({
          date: new Date(h.date).getTime() / 1000,
          open: h.open, high: h.high, low: h.low, close: h.close,
        }));
    }
  } catch (_) {}

  // Retorna vazio se não há histórico pré-carregado para este ativo
  return [];
}

export const B3_TICKERS = [
  'PETR4','PETR3','VALE3','ITUB4','BBDC4','WEGE3','RENT3','ABEV3','BBAS3','SUZB3',
  'ELET3','ELET6','RADL3','LREN3','HAPV3','MULT3','JBSS3','RAIL3','GGBR4','CSNA3',
  'USIM5','CSAN3','VIVT3','SBSP3','EGIE3','ENEV3','CMIG4','PRIO3','CPLE6','BRFS3',
  'TOTS3','HYPE3','VBBR3','KLBN11','ASAI3','BEEF3','TIMS3','EMBR3','AZUL4','GOLL4',
  'CYRE3','MRVE3','RDOR3','FLRY3','PSSA3','ARZZ3','SOMA3','MGLU3','NTCO3','AURE3',
  'HGLG11','XPML11','HGRU11','VISC11','KNRI11','BTLG11','MXRF11','IRDM11','CPTS11',
  'BOVA11','SMAL11','IVVB11','HASH11','SPXI11',
];

export async function fetchAvailableTickers() {
  try {
    const all = await getAll();
    return Object.keys(all)
      .filter(k => k !== '_meta' && all[k].regularMarketPrice)
      .map(s => ({ stock: s }));
  } catch (_) {
    return B3_TICKERS.map(s => ({ stock: s }));
  }
}
