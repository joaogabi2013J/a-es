import React from 'react';
import './DividendTable.css';

function fmt(n) {
  if (n == null) return '--';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function fmtDate(s) {
  if (!s) return '--';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('pt-BR');
}

export default function DividendTable({ dividends }) {
  const sorted = [...dividends].sort(
    (a, b) => new Date(b.paymentDate || b.approvedOn) - new Date(a.paymentDate || a.approvedOn)
  ).slice(0, 10);

  return (
    <div className="dividend-section">
      <h3>Histórico de Dividendos</h3>
      <div className="dividend-table-wrap">
        <table className="dividend-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Valor (R$)</th>
              <th>Data Ex</th>
              <th>Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <tr key={i}>
                <td><span className="div-type">{d.type || d.label || 'Dividendo'}</span></td>
                <td className="div-value">R$ {fmt(d.rate || d.value)}</td>
                <td>{fmtDate(d.relatedTo)}</td>
                <td>{fmtDate(d.paymentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
