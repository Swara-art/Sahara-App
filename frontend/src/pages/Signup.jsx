import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'citizen', pincode: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/signup', formData);
      login(res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #111 0%, #000 100%)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass" 
        style={{ padding: '3rem', borderRadius: '32px', width: '100%', maxWidth: '450px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join the Sahara community today</p>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="input-group">
            <input 
              type="text" placeholder="Full Name" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="input-group">
            <input 
              type="email" placeholder="Email Address" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="input-group">
            <input 
              type="password" placeholder="Password" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <input 
              type="text" placeholder="6-digit Pincode" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>I am a:</label>
            <div style={{ ...inputStyle, cursor: 'default', color: 'var(--text-primary)' }}>
              Citizen
            </div>
          </div>

          {formData.role === 'authority' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Department:</label>
              <select 
                required
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="Roads">Roads & Transport</option>
                <option value="Water">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Waste">Waste Management</option>
                <option value="Police">Police / Safety</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>
            Sign Up <UserPlus size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '1rem 1.2rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-glass)',
  borderRadius: '12px',
  color: 'white',
  outline: 'none',
  fontSize: '1rem',
  transition: 'var(--transition)',
  cursor: 'text'
};

export default Signup;
