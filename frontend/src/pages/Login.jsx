import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', formData);
      login(res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass" 
        style={formContainerStyle}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={logoBadgeStyle}>SAHARA</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Enter your credentials to access the hub</p>
        </div>

        {error && <div style={errorBannerStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={inputWrapperStyle}>
            <Mail size={20} style={iconStyle} />
            <input 
              type="email" placeholder="Email Address" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div style={inputWrapperStyle}>
            <Lock size={20} style={iconStyle} />
            <input 
              type="password" placeholder="Password" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', padding: '1.2rem', borderRadius: '18px', fontSize: '1.1rem', marginTop: '1rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={20} />
          </button>
        </form>

        <div style={footerStyle}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            New to the community? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 800 }}>Create Account</Link>
          </p>
        </div>
      </motion.div>

      {/* Decorative Orbs */}
      <div style={{ ...orbStyle, top: '10%', right: '10%', background: 'var(--primary)', opacity: 0.1 }} />
      <div style={{ ...orbStyle, bottom: '10%', left: '10%', background: 'var(--secondary)', opacity: 0.05 }} />
    </div>
  );
};

// Styles
const pageContainerStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
  background: '#000', padding: '2rem', position: 'relative', overflow: 'hidden'
};

const formContainerStyle = {
  padding: '5rem 4rem', borderRadius: '48px', width: '100%', maxWidth: '520px',
  border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.8)',
  zIndex: 1
};

const logoBadgeStyle = {
  display: 'inline-block', padding: '0.5rem 1.2rem', borderRadius: '14px', 
  background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
  fontSize: '0.85rem', fontWeight: 900, color: '#fff', marginBottom: '2rem', letterSpacing: '2px'
};

const errorBannerStyle = {
  padding: '1.2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '16px', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2.5rem'
};

const inputWrapperStyle = {
  position: 'relative', display: 'flex', alignItems: 'center'
};

const iconStyle = {
  position: 'absolute', left: '1.5rem', color: 'var(--text-muted)', opacity: 0.4
};

const inputStyle = {
  width: '100%', padding: '1.4rem 1.4rem 1.4rem 4rem', background: 'rgba(255, 255, 255, 0.03)', 
  border: '1px solid var(--border-glass)', borderRadius: '20px', color: 'white', 
  outline: 'none', fontSize: '1.05rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};

const footerStyle = {
  textAlign: 'center', marginTop: '3.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem'
};

const orbStyle = {
  position: 'absolute', width: '40vw', height: '40vw', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0
};

export default Login;
