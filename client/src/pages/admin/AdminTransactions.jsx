import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AdminTransactions() {
  const [data, setData] = useState({ transactions: [], summary: [] });

  useEffect(() => { api('/admin/transactions').then(setData).catch(console.error); }, []);

  return (
    <div>
      <h1 className="admin-page-title gold-text">Pay-in / Payout Reports</h1>
      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        {data.summary?.map(s => (
          <div key={s.type} className="admin-stat-card">
            <div className="stat-value gold-text">₹{Number(s.total).toFixed(0)}</div>
            <div className="stat-label">{s.type} ({s.count})</div>
          </div>
        ))}
      </div>
      <div className="admin-table-wrap">
      <table className="table">
        <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {data.transactions?.map(t => (
            <tr key={t.id}>
              <td>{t.username}</td>
              <td>{t.type}</td>
              <td>₹{t.amount}</td>
              <td>{t.status}</td>
              <td>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
