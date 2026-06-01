import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AdminReferrals() {
  const [data, setData] = useState({ referrals: [], stats: {} });

  useEffect(() => { api('/admin/referrals').then(setData).catch(console.error); }, []);

  return (
    <div>
      <h1 className="admin-page-title gold-text">Referral Reports</h1>
      <div className="admin-stat-grid" style={{ maxWidth: 480, marginBottom: 24 }}>
        <div className="admin-stat-card"><div className="stat-value">{data.stats?.total || 0}</div><div className="stat-label">Total Referrals</div></div>
        <div className="admin-stat-card"><div className="stat-value gold-text">₹{Number(data.stats?.total_bonus || 0).toFixed(0)}</div><div className="stat-label">Total Bonus Paid</div></div>
      </div>
      <div className="admin-table-wrap">
      <table className="table">
        <thead><tr><th>Referrer</th><th>Referred</th><th>Bonus</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {data.referrals?.map(r => (
            <tr key={r.id}>
              <td>{r.referrer}</td>
              <td>{r.referred}</td>
              <td>₹{r.bonus_amount}</td>
              <td>{r.status}</td>
              <td>{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
