const BASE_URL = 'https://brapi.dev/api';
const TOKEN = 'oL8DNUikcZUzBB1mWSLvUv';

const headers = { Authorization: `Bearer ${TOKEN}` };

export async function fetchQuote(ticker) {
  const res = await fetch(
    `${BASE_URL}/quote/${ticker}?token=${TOKEN}&fundamental=true&dividends=true`
  );
  if (!res.ok) throw new Error(`Erro ao buscar ${ticker}`);
  const data = await res.json();
  return data.results?.[0] ?? null;
}

export async function fetchMultipleQuotes(tickers) {
  const joined = tickers.join(',');
  const res = await fetch(
    `${BASE_URL}/quote/${joined}?token=${TOKEN}`
  );
  if (!res.ok) throw new Error('Erro ao buscar cotações');
  const data = await res.json();
  return data.results ?? [];
}

export async function fetchHistory(ticker, range = '1mo', interval = '1d') {
  const res = await fetch(
    `${BASE_URL}/quote/${ticker}?token=${TOKEN}&range=${range}&interval=${interval}`
  );
  if (!res.ok) throw new Error(`Erro ao buscar histórico de ${ticker}`);
  const data = await res.json();
  return data.results?.[0]?.historicalDataPrice ?? [];
}

export async function fetchAvailableTickers() {
  const res = await fetch(`${BASE_URL}/quote/list?token=${TOKEN}`);
  if (!res.ok) throw new Error('Erro ao buscar lista de ativos');
  const data = await res.json();
  return data.stocks ?? [];
}

export async function fetchInflation() {
  const res = await fetch(`${BASE_URL}/v2/prime-rate?country=brazil&token=${TOKEN}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.prime_rate?.[0] ?? null;
}
