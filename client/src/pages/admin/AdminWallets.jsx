import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function AdminWallets() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    api('/admin/wallets').then(setWallets).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="admin-page-title gold-text">Wallet Overview</h1>
      <p className="admin-muted" style={{ marginBottom: 20 }}>
        Balance add karne ke liye{' '}
        <Link to="/admin/users" style={{ color: 'var(--gold)', fontWeight: 700 }}>
          User Management
        </Link>{' '}
        use karo (user select + password verify).
      </p>
      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>User ID</th>
              <th>Balance</th>
              <th>Deposited</th>
              <th>Withdrawn</th>
              <th>Won</th>
              <th>Lost</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w) => (
              <tr key={w.id}>
                <td>
                  <strong>{w.username}</strong>
                  <br />
                  <small>{w.email}</small>
                </td>
                <td>
                  <small style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{w.user_id}</small>
                </td>
                <td className="gold-text">₹{Number(w.balance).toFixed(0)}</td>
                <td>₹{Number(w.total_deposited).toFixed(0)}</td>
                <td>₹{Number(w.total_withdrawn).toFixed(0)}</td>
                <td>₹{Number(w.total_won).toFixed(0)}</td>
                <td>₹{Number(w.total_lost).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
