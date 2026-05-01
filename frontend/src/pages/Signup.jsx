import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Shield, MapPin } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'citizen', pincode: '', department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/signup', formData);
      login(res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      const errorData = err.response?.data?.detail;
      if (Array.isArray(errorData)) {
        // Extract the most relevant error message from Pydantic's response
        const msg = errorData[0]?.msg || 'Invalid input data';
        const field = errorData[0]?.loc[errorData[0]?.loc.length - 1];
        setError(`${field}: ${msg}`);
      } else {
        setError(typeof errorData === 'string' ? errorData : 'Signup failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass" 
        style={formContainerStyle}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={logoBadgeStyle}>SAHARA</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join the future of civic management</p>
        </div>

        {error && <div style={errorBannerStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={roleToggleStyle}>
             <button 
              type="button" 
              onClick={() => setFormData({...formData, role: 'citizen'})}
              style={{ ...roleButtonStyle, background: formData.role === 'citizen' ? 'var(--primary)' : 'transparent', color: formData.role === 'citizen' ? '#fff' : 'var(--text-muted)' }}
             >
               <User size={16} /> Citizen
             </button>
             <button 
              type="button" 
              onClick={() => setFormData({...formData, role: 'authority'})}
              style={{ ...roleButtonStyle, background: formData.role === 'authority' ? 'var(--primary)' : 'transparent', color: formData.role === 'authority' ? '#fff' : 'var(--text-muted)' }}
             >
               <Shield size={16} /> Authority
             </button>
          </div>

          <div style={inputWrapperStyle}>
            <User size={18} style={iconStyle} />
            <input 
              type="text" placeholder="Full Name" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div style={inputWrapperStyle}>
            <Mail size={18} style={iconStyle} />
            <input 
              type="email" placeholder="Email Address" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div style={inputWrapperStyle}>
            <Lock size={18} style={iconStyle} />
            <input 
              type="password" placeholder="Password" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div style={inputWrapperStyle}>
            <MapPin size={18} style={iconStyle} />
            <input 
              type="text" placeholder="6-digit Pincode" required 
              style={inputStyle}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            />
          </div>

          {formData.role === 'authority' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
              <label style={labelStyle}>Department</label>
              <select 
                required
                style={selectStyle}
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
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', padding: '1.2rem', marginTop: '1rem', borderRadius: '16px' }}>
            {loading ? 'Creating Account...' : 'Sign Up'} <UserPlus size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

// Styles
const pageContainerStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
  background: 'radial-gradient(circle at center, #0a0a0a 0%, #000 100%)', padding: '2rem'
};

const formContainerStyle = {
  padding: '4rem 3rem', borderRadius: '40px', width: '100%', maxWidth: '500px',
  border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

const logoBadgeStyle = {
  display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '12px', 
  background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
  fontSize: '0.8rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', letterSpacing: '2px'
};

const errorBannerStyle = {
  padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '12px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '2rem'
};

const roleToggleStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.03)',
  padding: '0.4rem', borderRadius: '16px', marginBottom: '1rem'
};

const roleButtonStyle = {
  padding: '0.8rem', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: '0.3s',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontWeight: 700, fontSize: '0.9rem'
};

const inputWrapperStyle = {
  position: 'relative', display: 'flex', alignItems: 'center'
};

const iconStyle = {
  position: 'absolute', left: '1.2rem', color: 'var(--text-muted)', opacity: 0.5
};

const inputStyle = {
  width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', background: 'rgba(255, 255, 255, 0.03)', 
  border: '1px solid var(--border-glass)', borderRadius: '16px', color: 'white', 
  outline: 'none', fontSize: '1rem', transition: '0.2s'
};

const selectStyle = {
  width: '100%', padding: '1.2rem', background: 'rgba(255, 255, 255, 0.03)', 
  border: '1px solid var(--border-glass)', borderRadius: '16px', color: 'white', 
  outline: 'none', fontSize: '1rem', marginTop: '0.5rem'
};

const labelStyle = {
  fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '0.5rem'
};

export default Signup;
