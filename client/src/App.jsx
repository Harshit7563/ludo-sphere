import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SoundProvider } from './context/SoundContext';
import Splash from './components/Splash';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Matchmaking from './pages/Matchmaking';
import Tournaments from './pages/Tournaments';
import Friends from './pages/Friends';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import Referral from './pages/Referral';
import GameBoard from './pages/GameBoard';
import Transactions from './pages/Transactions';
import Kyc from './pages/Kyc';
import HeadTail from './pages/HeadTail';

import ProtectedRoute from './layouts/ProtectedRoute';
import UserLayout from './layouts/UserLayout';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWallets from './pages/admin/AdminWallets';
import AdminMatches from './pages/admin/AdminMatches';
import AdminTournaments from './pages/admin/AdminTournaments';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminFraud from './pages/admin/AdminFraud';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader" />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/home" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (loading) return <div className="loader" />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/home'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/head-tail" element={<HeadTail />} />
          <Route path="/game/:roomCode" element={<GameBoard />} />
        </Route>
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="wallets" element={<AdminWallets />} />
        <Route path="matches" element={<AdminMatches />} />
        <Route path="tournaments" element={<AdminTournaments />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="referrals" element={<AdminReferrals />} />
        <Route path="fraud" element={<AdminFraud />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/home') : '/login'} />} />
    </Routes>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className={`app-container rush-app${isAdmin ? ' app-container--admin' : ''}`}>
      <div className="app-viewport">
        <AppRoutes />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoundProvider>
          <SocketProvider>
            <AppShell />
          </SocketProvider>
        </SoundProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
