import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthField from '../components/auth/AuthField';
import { IconMail, IconLock } from '../components/auth/AuthIcons';
import LudoSphereLogo from '../components/LudoSphereLogo';
import { validateLogin } from '../utils/authValidation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.user.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-auth page-auth-screen rush-auth">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <motion.div
        className="auth-hero-block"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <LudoSphereLogo size="md" animated className="auth-logo-hero" />
        <p className="auth-tagline">Play fast. Win big.</p>
      </motion.div>

      <motion.div
        className="auth-card-premium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <h2 className="auth-card-title">Welcome back</h2>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <AuthField
            name="email"
            label="Email or username"
            type="text"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
            }}
            placeholder="you@email.com"
            icon={<IconMail />}
            autoComplete="username"
            error={fieldErrors.email}
          />
          <AuthField
            name="password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
            icon={<IconLock />}
            autoComplete="current-password"
            error={fieldErrors.password}
            endAdornment={
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            }
          />
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'SIGNING IN…' : 'PLAY NOW'}
          </button>
        </form>

        <p className="auth-footer-line">
          New player? <Link to="/register">Create free account</Link>
        </p>
      </motion.div>
    </div>
  );
}
