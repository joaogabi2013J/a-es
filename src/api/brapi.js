// Financial Modeling Prep (FMP) — gratuita, sem cartão de crédito
// Chave gratuita em: https://financialmodelingprep.com/developer/docs/
// Limite: 250 requisições/dia no plano free
//
// ⚠️ Substitua a linha abaixo pela sua chave gratuita:
function getKey() {
  return window.__FMP_KEY__ || process.env.REACT_APP_FMP_KEY || localStorage.getItem('fmp_api_key') || 'demo';
}

const BASE = 'https://financialmodelingprep.com/api/v3';

// Ações da B3 usam sufixo .SA (ex: PETR4.SA)
const toSA = t => t.endsWith('.SA') ? t : `${t}.SA`;
const fromSA = s => (s ?? '').replace('.SA', '');

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}apikey=${getKey()}`);
  if (!res.ok) throw new Error(`Erro FMP: ${res.status}`);
  return res.json();
}

function normalize(q) {
  if (!q) return null;
  return {
    symbol: fromSA(q.symbol),
    shortName: q.name ?? '',
    longName: q.name ?? '',
    sector: q.sector ?? '',
    industry: q.industry ?? '',
    regularMarketPrice: q.price,
    regularMarketChange: q.change,
    regularMarketChangePercent: q.changesPercentage,
    regularMarketDayHigh: q.dayHigh,
    regularMarketDayLow: q.dayLow,
    regularMarketVolume: q.volume,
    regularMarketOpen: q.open,
    regularMarketPreviousClose: q.previousClose,
    fiftyTwoWeekHigh: q.yearHigh,
    fiftyTwoWeekLow: q.yearLow,
    marketCap: q.marketCap,
    priceEarnings: q.pe,
    earningsPerShare: q.eps,
    averageDailyVolume10Day: q.avgVolume,
    dividendYield: q.dividendYield ?? null,
    priceToBook: q.priceToBook ?? null,
    beta: q.beta ?? null,
    dividendsData: null,
  };
}

export async function fetchQuote(ticker) {
  const data = await get(`/quote/${toSA(ticker)}`);
  const q = Array.isArray(data) ? data[0] : data;
  if (!q || !q.price) throw new Error(`Ativo ${ticker} não encontrado`);

  // Buscar dados adicionais em paralelo
  const [profile] = await Promise.allSettled([
    get(`/profile/${toSA(ticker)}`),
  ]);

  const prof = profile.status === 'fulfilled' && Array.isArray(profile.value)
    ? profile.value[0]
    : {};

  return normalize({
    ...q,
    sector: prof.sector ?? '',
    industry: prof.industry ?? '',
    beta: prof.beta ?? null,
    dividendYield: prof.lastDiv ? (prof.lastDiv / q.price) * 100 : null,
    priceToBook: prof.price && prof.bookValuePerShare
      ? prof.price / prof.bookValuePerShare
      : null,
  });
}

export async function fetchMultipleQuotes(tickers) {
  const symbols = tickers.map(toSA).join(',');
  const data = await get(`/quote/${symbols}`);
  return (Array.isArray(data) ? data : []).map(normalize).filter(Boolean);
}

export async function fetchHistory(ticker, range = '1mo') {
  const days = { '5d': 7, '1mo': 35, '3mo': 95, '6mo': 185, '1y': 370 };
  const limit = days[range] ?? 35;
  const data = await get(`/historical-price-full/${toSA(ticker)}?timeseries=${limit}`);
  const hist = data?.historical ?? [];
  return hist
    .slice()
    .reverse()
    .map(d => ({
      date: new Date(d.date).getTime() / 1000,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
}

// Lista completa de ativos B3
export const B3_TICKERS = [
  // Ações blue chips
  'PETR4','PETR3','VALE3','ITUB4','BBDC4','WEGE3','RENT3','ABEV3','BBAS3','SUZB3',
  'ELET3','ELET6','RADL3','LREN3','HAPV3','MULT3','JBSS3','RAIL3','GGBR4','CSNA3',
  'USIM5','CSAN3','VIVT3','SBSP3','EGIE3','ENEV3','CMIG4','PRIO3','CPLE6','BRFS3',
  'TOTS3','HYPE3','VBBR3','KLBN11','ASAI3','BEEF3','TIMS3','EMBR3','AZUL4','GOLL4',
  'CYRE3','MRVE3','EVEN3','EZTC3','RDOR3','FLRY3','PSSA3','ARZZ3','SOMA3','MGLU3',
  'VIIA3','PETZ3','NTCO3','DXCO3','AURE3','TEND3','HBSA3','RECV3','CMIN3','BRAP4',
  // FIIs
  'HGLG11','XPML11','HGRU11','VISC11','KNRI11','BTLG11','XPLG11','MXRF11','KNCR11',
  'BCFF11','VGIP11','IRDM11','VILG11','HGCR11','VRTA11','RBRF11','RBRY11','CPTS11',
  // BDRs
  'AAPL34','AMZO34','MSFT34','GOGL34','NFLX34','TSLA34','META34','NVDC34','JPMC34',
  // ETFs
  'BOVA11','SMAL11','IVVB11','HASH11','SPXI11','DIVO11','MATB11','GOVB11',
];

export async function fetchAvailableTickers() {
  return B3_TICKERS.map(s => ({ stock: s }));
}
