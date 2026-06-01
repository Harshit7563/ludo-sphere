import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('/admin/stats').then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="admin-loading">
        <div className="loader" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats.users?.total, icon: '👥' },
    { label: 'New Today', value: stats.users?.today, icon: '📈' },
    { label: 'Total Matches', value: stats.matches?.total, icon: '🎲' },
    { label: 'Finished', value: stats.matches?.finished, icon: '✅' },
    { label: 'Commission Revenue', value: `₹${Number(stats.revenue?.total || 0).toFixed(0)}`, icon: '💰' },
    { label: 'Active Games', value: stats.activeRooms?.total, icon: '🔴' },
  ];

  return (
    <div>
      <h1 className="admin-page-title gold-text">Dashboard</h1>
      <div className="admin-stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="admin-stat-card">
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-value gold-text">{c.value ?? 0}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
