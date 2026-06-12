import React from 'react';
import { TrendingUp, BarChart2, Star, Search } from 'lucide-react';
import './Header.css';

export default function Header({ activeTab, onTabChange, onSearch }) {
  return (
    <header className="header">
      <div className="header-brand">
        <TrendingUp size={28} className="header-icon" />
        <span className="header-title">Portal B3</span>
        <span className="header-badge">BRAPI</span>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => onTabChange('watchlist')}
        >
          <Star size={16} /> Watchlist
        </button>
        <button
          className={`nav-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => onTabChange('explore')}
        >
          <Search size={16} /> Explorar
        </button>
        <button
          className={`nav-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => onTabChange('market')}
        >
          <BarChart2 size={16} /> Mercado
        </button>
      </nav>
    </header>
  );
}
