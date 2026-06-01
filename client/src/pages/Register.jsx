import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthField from '../components/auth/AuthField';
import { IconUser, IconMail, IconLock, IconGift } from '../components/auth/AuthIcons';
import LudoSphereLogo from '../components/LudoSphereLogo';
import { validateRegister } from '../utils/authValidation';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    referralCode: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = field => e => {
    setForm({ ...form, [field]: e.target.value });
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validateRegister(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      await register(form);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-auth page-auth-screen page-auth-screen--register rush-auth auth-register-scroll">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <Link to="/login" className="auth-back" aria-label="Back to login">
        ←
      </Link>

      <motion.div
        className="auth-hero-block"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LudoSphereLogo size="md" animated className="auth-logo-hero" />
        <span className="auth-bonus-pill">
          <IconGift />
          ₹150 welcome bonus
        </span>
      </motion.div>

      <motion.div
        className="auth-card-premium"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <h2 className="auth-card-title">Join the arena</h2>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <AuthField
            name="username"
            label="Username"
            value={form.username}
            onChange={update('username')}
            placeholder="cool_player"
            icon={<IconUser />}
            autoComplete="username"
            error={fieldErrors.username}
          />
          <AuthField
            name="displayName"
            label="Display name"
            value={form.displayName}
            onChange={update('displayName')}
            placeholder="How friends see you"
            icon={<IconUser />}
            autoComplete="name"
          />
          <AuthField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="you@email.com"
            icon={<IconMail />}
            autoComplete="email"
            error={fieldErrors.email}
          />
          <AuthField
            name="password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={update('password')}
            placeholder="Min 6 characters"
            icon={<IconLock />}
            autoComplete="new-password"
            minLength={6}
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

          <details className="auth-referral-fold">
            <summary>Have a referral code?</summary>
            <AuthField
              label="Referral code"
              value={form.referralCode}
              onChange={update('referralCode')}
              placeholder="LCXXXXX"
              icon={<IconGift />}
            />
          </details>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'CREATING…' : 'START PLAYING'}
          </button>
        </form>

        <p className="auth-footer-line">
          Already playing? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
