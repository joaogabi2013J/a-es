import React, { useState } from 'react';
import Header from './components/Header';
import WatchlistView from './components/WatchlistView';
import ExploreView from './components/ExploreView';
import MarketView from './components/MarketView';
import AssetDetail from './components/AssetDetail';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('watchlist');
  const [selectedTicker, setSelectedTicker] = useState(null);

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
