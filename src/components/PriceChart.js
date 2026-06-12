import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useHistory } from '../hooks/useQuote';
import './PriceChart.css';

const RANGES = [
  { label: '1S', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1A', value: '1y' },
];

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="ct-date">{formatDate(p.date)}</div>
      <div className="ct-price">R$ {p.close?.toFixed(2)}</div>
      <div className="ct-row"><span>Abertura</span><span>R$ {p.open?.toFixed(2)}</span></div>
      <div className="ct-row"><span>Máxima</span><span>R$ {p.high?.toFixed(2)}</span></div>
      <div className="ct-row"><span>Mínima</span><span>R$ {p.low?.toFixed(2)}</span></div>
    </div>
  );
}

export default function PriceChart({ ticker, currentPrice }) {
  const [range, setRange] = useState('1mo');
  const { history, loading } = useHistory(ticker, range);

  const first = history[0]?.close ?? currentPrice ?? 0;
  const last = history[history.length - 1]?.close ?? currentPrice ?? 0;
  const positive = last >= first;
  const color = positive ? '#00e676' : '#ff5252';

  return (
    <div className="price-chart">
      <div className="pc-toolbar">
        {RANGES.map(r => (
          <button
            key={r.value}
            className={`pc-range-btn ${range === r.value ? 'active' : ''}`}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="pc-loading">Carregando gráfico...</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3448" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: '#446688', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#446688', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v.toFixed(0)}`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill="url(#chartGrad)"
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
