#!/usr/bin/env python3
"""Busca dados da B3 via Stooq e salva como JSON estático."""

import requests, csv, io, json, os, sys
from datetime import datetime, date, timedelta

TICKERS = [
    'PETR4','PETR3','VALE3','ITUB4','BBDC4','WEGE3','RENT3','ABEV3','BBAS3','SUZB3',
    'ELET3','ELET6','RADL3','LREN3','HAPV3','MULT3','JBSS3','RAIL3','GGBR4','CSNA3',
    'USIM5','CSAN3','VIVT3','SBSP3','EGIE3','ENEV3','CMIG4','PRIO3','CPLE6','BRFS3',
    'TOTS3','HYPE3','VBBR3','KLBN11','ASAI3','BEEF3','TIMS3','EMBR3','AZUL4','GOLL4',
    'CYRE3','MRVE3','RDOR3','FLRY3','PSSA3','ARZZ3','SOMA3','MGLU3','NTCO3','AURE3',
    'HGLG11','XPML11','HGRU11','VISC11','KNRI11','BTLG11','MXRF11','IRDM11','CPTS11',
    'BOVA11','SMAL11','IVVB11','HASH11','SPXI11',
]

TOP_HISTORY = ['PETR4','VALE3','ITUB4','BBDC4','WEGE3','RENT3','ABEV3','BBAS3',
               'ELET3','RADL3','MGLU3','BOVA11','IVVB11','SMAL11']

SESS = requests.Session()
SESS.headers['User-Agent'] = 'Mozilla/5.0 (compatible; B3Portal/1.0)'


def parse_csv(text):
    text = text.strip()
    if not text or 'N/D' in text:
        return []
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)


def fetch_quotes(tickers):
    syms = ';'.join(f"{t.lower()}.sa" for t in tickers)
    url = f"https://stooq.com/q/l/?s={syms}&f=sd2t2ohlcvn&h&e=csv"
    try:
        r = SESS.get(url, timeout=30)
        r.raise_for_status()
        rows = parse_csv(r.text)
        result = {}
        for row in rows:
            sym = (row.get('Symbol') or '').upper().replace('.SA', '')
            close = float(row.get('Close') or 0)
            open_ = float(row.get('Open') or 0)
            if sym and close:
                chg = close - open_ if open_ else 0
                chg_pct = (chg / open_ * 100) if open_ else 0
                result[sym] = {
                    'symbol': sym,
                    'shortName': row.get('Name', ''),
                    'regularMarketPrice': close,
                    'regularMarketOpen': open_,
                    'regularMarketDayHigh': float(row.get('High') or 0),
                    'regularMarketDayLow': float(row.get('Low') or 0),
                    'regularMarketVolume': int(row.get('Volume') or 0),
                    'regularMarketChange': round(chg, 4),
                    'regularMarketChangePercent': round(chg_pct, 4),
                    'date': row.get('Date', ''),
                }
        return result
    except Exception as e:
        print(f"  Erro ao buscar lote: {e}", file=sys.stderr)
        return {}


def fetch_history(ticker, days=365):
    today = date.today()
    d1 = (today - timedelta(days=days)).strftime('%Y%m%d')
    d2 = today.strftime('%Y%m%d')
    url = f"https://stooq.com/q/d/l/?s={ticker.lower()}.sa&d1={d1}&d2={d2}&i=d"
    try:
        r = SESS.get(url, timeout=30)
        r.raise_for_status()
        rows = parse_csv(r.text)
        hist = []
        for row in rows:
            if row.get('Date') and row.get('Close'):
                hist.append({
                    'date': row['Date'],
                    'open':   float(row.get('Open')  or 0),
                    'high':   float(row.get('High')  or 0),
                    'low':    float(row.get('Low')   or 0),
                    'close':  float(row['Close']),
                    'volume': int(row.get('Volume')  or 0),
                })
        # Calcula prev close para adicionar no campo de quotes
        return hist
    except Exception as e:
        print(f"  Erro histórico {ticker}: {e}", file=sys.stderr)
        return []


if __name__ == '__main__':
    out_dir = sys.argv[1] if len(sys.argv) > 1 else 'public/data'
    os.makedirs(f"{out_dir}/history", exist_ok=True)

    print(f"Buscando {len(TICKERS)} ativos...")
    all_quotes = {}
    batch = 30
    for i in range(0, len(TICKERS), batch):
        chunk = TICKERS[i:i+batch]
        q = fetch_quotes(chunk)
        all_quotes.update(q)
        print(f"  Lote {i//batch+1}: {len(q)} cotações")

    all_quotes['_meta'] = {
        'updated_at': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        'count': len(all_quotes) - 1,
    }

    quotes_path = f"{out_dir}/quotes.json"
    with open(quotes_path, 'w') as f:
        json.dump(all_quotes, f, ensure_ascii=False)
    print(f"Salvo: {quotes_path} ({len(all_quotes)-1} ativos)")

    print(f"Buscando histórico para {len(TOP_HISTORY)} ativos...")
    for ticker in TOP_HISTORY:
        hist = fetch_history(ticker)
        if hist:
            path = f"{out_dir}/history/{ticker}.json"
            with open(path, 'w') as f:
                json.dump(hist, f)
            print(f"  {ticker}: {len(hist)} registros")

    print("Concluído!")
