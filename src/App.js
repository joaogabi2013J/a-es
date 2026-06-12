import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WatchlistView from './components/WatchlistView';
import ExploreView from './components/ExploreView';
import MarketView from './components/MarketView';
import AssetDetail from './components/AssetDetail';
import ApiKeyGate from './components/ApiKeyGate';
import './App.css';

const KEY_STORAGE = 'fmp_api_key';
const ENV_KEY = process.env.REACT_APP_FMP_KEY;

export default function App() {
  const [tab, setTab] = useState('watchlist');
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [apiKey, setApiKey] = useState(() => {
    if (ENV_KEY && ENV_KEY !== 'demo') return ENV_KEY;
    return localStorage.getItem(KEY_STORAGE) || '';
  });

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(KEY_STORAGE, apiKey);
      // Injeta a chave no módulo de API em runtime
      window.__FMP_KEY__ = apiKey;
    }
  }, [apiKey]);

  if (!apiKey) {
    return <ApiKeyGate onKey={setApiKey} />;
  }

  return (
    <div className="app">
      <Header activeTab={tab} onTabChange={t => { setTab(t); setSelectedTicker(null); }} />
      <main className="main">
        {selectedTicker ? (
          <AssetDetail ticker={selectedTicker} onBack={() => setSelectedTicker(null)} />
        ) : tab === 'watchlist' ? (
          <WatchlistView onSelectTicker={setSelectedTicker} />
        ) : tab === 'explore' ? (
          <ExploreView onSelectTicker={setSelectedTicker} />
        ) : (
          <MarketView onSelectTicker={setSelectedTicker} />
        )}
      </main>
    </div>
  );
}
