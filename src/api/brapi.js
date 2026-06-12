// Stooq.com — dados gratuitos de bolsas globais incluindo B3
// Sem chave de API · Sem cadastro · 100% grátis
// Ações da B3 usam sufixo .sa (ex: petr4.sa)

const STOOQ = 'https://stooq.com';

// Tenta múltiplos proxies CORS em sequência
const PROXIES = [
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
];

async function stooqFetch(path) {
  const target = `${STOOQ}${path}`;
  for (const makeUrl of PROXIES) {
    try {
      const res = await fetch(makeUrl(target));
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.includes('N/D') || text.split('\n').length < 2) continue;
      return text;
    } catch (_) { continue; }
  }
  throw new Error('Não foi possível buscar dados da B3.');
}

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/\r/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
  });
}

function normalizeRow(row) {
  const close = parseFloat(row.Close) || null;
  const open = parseFloat(row.Open) || null;
  const chg = (close != null && open != null) ? close - open : null;
  const chgPct = (chg != null && open) ? (chg / open) * 100 : null;
  return {
    symbol: (row.Symbol ?? '').toUpperCase().replace('.SA', ''),
    shortName: row.Name ?? '',
    longName: row.Name ?? '',
    sector: '', industry: '',
    regularMarketPrice: close,
    regularMarketChange: chg,
    regularMarketChangePercent: chgPct,
    regularMarketDayHigh: parseFloat(row.High) || null,
    regularMarketDayLow: parseFloat(row.Low) || null,
    regularMarketVolume: parseInt(row.Volume) || null,
    regularMarketOpen: open,
    regularMarketPreviousClose: null,
    fiftyTwoWeekHigh: null,
    fiftyTwoWeekLow: null,
    marketCap: null,
    priceEarnings: null,
    priceToBook: null,
    dividendYield: null,
    beta: null,
    earningsPerShare: null,
    averageDailyVolume10Day: null,
    dividendsData: null,
  };
}

const toSym = t => `${t.toLowerCase()}.sa`;

export async function fetchMultipleQuotes(tickers) {
  const syms = tickers.map(toSym).join(';');
  const text = await stooqFetch(`/q/l/?s=${syms}&f=sd2t2ohlcvn&h&e=csv`);
  return parseCSV(text)
    .map(normalizeRow)
    .filter(q => q.regularMarketPrice != null);
}

export async function fetchHistory(ticker, range = '1mo') {
  const days = { '5d': 7, '1mo': 35, '3mo': 95, '6mo': 185, '1y': 365 }[range] ?? 35;
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  const fmt = d => d.toISOString().split('T')[0].replace(/-/g, '');
  const text = await stooqFetch(
    `/q/d/l/?s=${toSym(ticker)}&d1=${fmt(from)}&d2=${fmt(to)}&i=d`
  );
  return parseCSV(text)
    .filter(r => r.Date && r.Close)
    .map(r => ({
      date: new Date(r.Date).getTime() / 1000,
      open: parseFloat(r.Open) || null,
      high: parseFloat(r.High) || null,
      low: parseFloat(r.Low) || null,
      close: parseFloat(r.Close) || null,
    }))
    .filter(r => r.close != null);
}

export async function fetchQuote(ticker) {
  const text = await stooqFetch(`/q/l/?s=${toSym(ticker)}&f=sd2t2ohlcvn&h&e=csv`);
  const rows = parseCSV(text);
  if (!rows.length || !rows[0].Close) throw new Error(`${ticker} não encontrado`);
  const quote = normalizeRow(rows[0]);

  // Busca histórico de 1 ano para calcular 52wk, prev close e change real
  try {
    const hist = await fetchHistory(ticker, '1y');
    if (hist.length >= 2) {
      const sorted = [...hist].sort((a, b) => a.date - b.date);
      const prevClose = sorted[sorted.length - 2]?.close ?? null;
      const closes = sorted.map(h => h.close).filter(Boolean);
      quote.regularMarketPreviousClose = prevClose;
      if (prevClose && quote.regularMarketPrice) {
        quote.regularMarketChange = quote.regularMarketPrice - prevClose;
        quote.regularMarketChangePercent =
          ((quote.regularMarketPrice - prevClose) / prevClose) * 100;
      }
      quote.fiftyTwoWeekHigh = Math.max(...closes);
      quote.fiftyTwoWeekLow = Math.min(...closes);
    }
  } catch (_) {}

  return quote;
}

export const B3_TICKERS = [
  'PETR4','PETR3','VALE3','ITUB4','BBDC4','WEGE3','RENT3','ABEV3','BBAS3','SUZB3',
  'ELET3','ELET6','RADL3','LREN3','HAPV3','MULT3','JBSS3','RAIL3','GGBR4','CSNA3',
  'USIM5','CSAN3','VIVT3','SBSP3','EGIE3','ENEV3','CMIG4','PRIO3','CPLE6','BRFS3',
  'TOTS3','HYPE3','VBBR3','KLBN11','ASAI3','BEEF3','TIMS3','EMBR3','AZUL4','GOLL4',
  'CYRE3','MRVE3','EVEN3','EZTC3','RDOR3','FLRY3','PSSA3','ARZZ3','SOMA3','MGLU3',
  'VIIA3','PETZ3','NTCO3','DXCO3','AURE3','RECV3','CMIN3','BRAP4',
  'HGLG11','XPML11','HGRU11','VISC11','KNRI11','BTLG11','XPLG11','MXRF11','KNCR11',
  'BCFF11','VGIP11','IRDM11','VILG11','HGCR11','VRTA11','CPTS11',
  'BOVA11','SMAL11','IVVB11','HASH11','SPXI11','DIVO11','MATB11','GOVB11',
  'AAPL34','AMZO34','MSFT34','GOGL34','NFLX34','TSLA34','META34','NVDC34',
];

export async function fetchAvailableTickers() {
  return B3_TICKERS.map(s => ({ stock: s }));
}
