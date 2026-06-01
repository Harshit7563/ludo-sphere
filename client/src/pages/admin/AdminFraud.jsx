import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AdminFraud() {
  const [logs, setLogs] = useState([]);

  const load = () => api('/admin/fraud').then(setLogs).catch(console.error);
  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    await api(`/admin/fraud/${id}/resolve`, { method: 'PUT' });
    load();
  };

  return (
    <div>
      <h1 className="admin-page-title gold-text">Fraud Monitoring</h1>
      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48 }}>🛡️</div>
          <p className="admin-muted" style={{ marginTop: 12 }}>No active fraud alerts</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
        <table className="table">
          <thead><tr><th>User</th><th>Type</th><th>Severity</th><th>Description</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>{l.username || '—'}</td>
                <td>{l.type}</td>
                <td><span className="badge" style={{ color: l.severity === 'critical' ? 'var(--red)' : 'var(--gold)' }}>{l.severity}</span></td>
                <td>{l.description}</td>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td><button className="btn btn-gold btn-sm" onClick={() => resolve(l.id)}>Resolve</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
