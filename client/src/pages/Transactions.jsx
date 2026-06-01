import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import RushHeader from '../components/RushHeader';

const CREDIT_TYPES = ['win', 'deposit', 'bonus', 'referral', 'refund'];

const TX_META = {
  deposit: { label: 'Deposit', tone: 'green', icon: 'deposit' },
  withdraw: { label: 'Withdraw', tone: 'orange', icon: 'withdraw' },
  win: { label: 'Game Win', tone: 'green', icon: 'win' },
  loss: { label: 'Game Loss', tone: 'red', icon: 'loss' },
  bonus: { label: 'Bonus', tone: 'purple', icon: 'bonus' },
  referral: { label: 'Referral', tone: 'cyan', icon: 'referral' },
  commission: { label: 'Commission', tone: 'red', icon: 'loss' },
  refund: { label: 'Refund', tone: 'blue', icon: 'deposit' },
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'credit', label: 'Credit' },
  { id: 'debit', label: 'Debit' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
];

function TxIcon({ type }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' };
  switch (type) {
    case 'deposit':
      return (
        <svg {...common}><path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'withdraw':
      return (
        <svg {...common}><path d="M12 21V9M8 13l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 5h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'win':
      return (
        <svg {...common}><path d="M8 4h8v5a4 4 0 01-8 0V4z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" /><path d="M10 17h4v3h-4v-3zM7 20h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'bonus':
      return (
        <svg {...common}><path d="M12 3l1.5 3L17 7l-2.5 2.5.5 3.5L12 11.5 8.5 13l.5-3.5L6 7l3.5-1L12 3z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.12" /></svg>
      );
    case 'referral':
      return (
        <svg {...common}><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" /><path d="M4 19c0-2.5 2.2-4.5 5-4.5M16 6h4M18 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      );
    default:
      return (
        <svg {...common}><path d="M7 4h10v16H7V4z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" /><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      );
  }
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function isCredit(type) {
  return CREDIT_TYPES.includes(type);
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api('/wallet/transactions')
      .then((d) => setTransactions(d.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (isCredit(t.type)) credit += amt;
      else debit += amt;
    });
    return { credit, debit, count: transactions.length };
  }, [transactions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    if (filter === 'credit') return transactions.filter((t) => isCredit(t.type));
    if (filter === 'debit') return transactions.filter((t) => !isCredit(t.type));
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  return (
    <div className="page page-rush page-transactions">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <RushHeader />

      <div className="tx-topbar">
        <button type="button" className="tx-back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1>Transactions</h1>
      </div>

      {loading ? (
        <div className="tx-loading">
          <div className="loader" />
          <p>Loading history...</p>
        </div>
      ) : (
        <>
          <div className="tx-summary">
            <div className="tx-summary-card tx-summary-green">
              <span>Total In</span>
              <strong>+₹{formatMoney(summary.credit)}</strong>
            </div>
            <div className="tx-summary-card tx-summary-red">
              <span>Total Out</span>
              <strong>-₹{formatMoney(summary.debit)}</strong>
            </div>
            <div className="tx-summary-card tx-summary-blue">
              <span>Count</span>
              <strong>{summary.count}</strong>
            </div>
          </div>

          <div className="tx-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`tx-filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="tx-list">
            {filtered.length === 0 ? (
              <div className="tx-empty">
                <span>📜</span>
                <h3>No transactions</h3>
                <p>{filter === 'all' ? 'Your activity will show here' : 'Nothing in this filter'}</p>
              </div>
            ) : (
              filtered.map((t, i) => {
                const meta = TX_META[t.type] || { label: t.type, tone: 'blue', icon: 'loss' };
                const credit = isCredit(t.type);

                return (
                  <motion.div
                    key={t.id}
                    className={`tx-item tx-item-${meta.tone}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <span className={`tx-item-icon tx-icon-${meta.tone}`}>
                      <TxIcon type={meta.icon} />
                    </span>
                    <div className="tx-item-body">
                      <div className="tx-item-row">
                        <strong>{meta.label}</strong>
                        <span className={`tx-amount ${credit ? 'credit' : 'debit'}`}>
                          {credit ? '+' : '-'}₹{formatMoney(t.amount)}
                        </span>
                      </div>
                      <p className="tx-desc">{t.description || meta.label}</p>
                      <div className="tx-item-meta">
                        <span>{new Date(t.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`tx-status tx-status-${t.status || 'completed'}`}>{t.status || 'completed'}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
