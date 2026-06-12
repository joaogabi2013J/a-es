import React, { useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';
import './ApiKeyGate.css';

export default function ApiKeyGate({ onKey }) {
  const [input, setInput] = useState('');

  return (
    <div className="gate-overlay">
      <div className="gate-card">
        <Key size={36} className="gate-icon" />
        <h2>Configure sua chave gratuita</h2>
        <p>
          Este portal usa a <strong>Financial Modeling Prep</strong> — API
          gratuita com dados completos da B3 (cotações, gráficos, dividendos,
          fundamentos).
        </p>

        <div className="gate-steps">
          <div className="gate-step">
            <span>1</span>
            <span>
              Acesse{' '}
              <a
                href="https://financialmodelingprep.com/developer/docs/"
                target="_blank"
                rel="noreferrer"
              >
                financialmodelingprep.com <ExternalLink size={12} />
              </a>
            </span>
          </div>
          <div className="gate-step">
            <span>2</span>
            <span>Clique em <strong>"Get my API key"</strong> e cadastre seu e-mail (grátis)</span>
          </div>
          <div className="gate-step">
            <span>3</span>
            <span>Cole sua chave abaixo</span>
          </div>
        </div>

        <div className="gate-form">
          <input
            className="gate-input"
            value={input}
            onChange={e => setInput(e.target.value.trim())}
            placeholder="Cole sua chave aqui..."
            autoFocus
          />
          <button
            className="gate-btn"
            onClick={() => { if (input) onKey(input); }}
            disabled={!input}
          >
            Entrar
          </button>
        </div>

        <p className="gate-note">
          Plano gratuito: 250 requisições/dia · Sem cartão de crédito
        </p>
      </div>
    </div>
  );
}
