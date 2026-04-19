import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, signupUser } from '../api/api';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already logged in
  if (isLoggedIn) { navigate('/', { replace: true }); return null; }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function switchMode(m) {
    setMode(m);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (mode === 'signup') {
      if (!form.name.trim())     return setError('Name is required.');
      if (!form.email.trim())    return setError('Email is required.');
      if (!form.password.trim()) return setError('Password is required (min 6 chars).');
      if (form.password.length < 6) return setError('Password must be at least 6 characters.');
      if (!form.pincode.trim() || form.pincode.length !== 6)
        return setError('Pincode must be exactly 6 digits.');
    } else {
      if (!form.email.trim())    return setError('Email is required.');
      if (!form.password.trim()) return setError('Password is required.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await loginUser(form.email.trim(), form.password);
        if (!data.access_token) throw new Error('No token received from server.');
        login(data.access_token);
        navigate('/', { replace: true });
      } else {
        await signupUser({
          name:     form.name.trim(),
          email:    form.email.trim(),
          password: form.password,
          pincode:  form.pincode.trim(),
        });
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setForm((prev) => ({ ...prev, name: '', password: '', pincode: '' }));
      }
    } catch (err) {
      setError(err.message || (mode === 'login' ? 'Login failed.' : 'Signup failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🏔️</span>
          <h1 className="login-logo-text">Sahara</h1>
        </div>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Sign in to report and track civic complaints'
            : 'Create your account to get started'}
        </p>

        {/* Mode toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {error   && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Name — signup only */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              className="form-input"
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
              value={form.password}
              onChange={handleChange}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Pincode — signup only */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-pincode">Pincode (6 digits)</label>
              <input
                id="auth-pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="e.g. 110001"
                value={form.pincode}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading
              ? <><span className="spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="login-back">
          <Link to="/">← Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}
