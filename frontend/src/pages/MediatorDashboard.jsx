import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, Layers, Flag, Home, Info, CheckCircle, 
  MapPin, MessageSquare, TrendingUp, AlertTriangle 
} from 'lucide-react';
import api from '../api/axios';

const MediatorDashboard = () => {
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApproved();
  }, []);

  const fetchApproved = async () => {
    try {
      const res = await api.get('/mediator/approved');
      setApproved(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (id, data) => {
    try {
      await api.post(`/mediator/${id}/assign?category=${encodeURIComponent(data.category)}&priority=${encodeURIComponent(data.priority)}&department=${encodeURIComponent(data.department)}`);
      fetchApproved();
    } catch (err) {
      alert('Assignment failed');
    }
  };

  return (
    <div className="mediator-dashboard">
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>Assignment Board</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Review approved reports and dispatch them to the appropriate response units.</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1.2rem', border: '1px solid rgba(124, 58, 237, 0.2)', background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%)' }}>
        <div style={{ padding: '10px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px' }}>
            <Info size={24} style={{ color: '#7c3aed' }} />
        </div>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
          High priority reports require immediate dispatch. Review the **Admin Note** for specific validator instructions.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Synchronizing Board...</div>
      ) : approved.length === 0 ? (
        <div className="glass" style={{ padding: '6rem', textAlign: 'center', borderRadius: '40px' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', marginBottom: '1.5rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>All assignments completed</h3>
          <p style={{ color: 'var(--text-muted)' }}>The queue is currently empty. Great work!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {approved.map(item => (
            <AssignCard key={item._id} item={item} onAssign={handleAssign} />
          ))}
        </div>
      )}
    </div>
  );
};

const AssignCard = ({ item, onAssign }) => {
  const [data, setData] = useState({ category: 'Infrastructure', priority: 'Medium', department: 'PWD' });

  return (
    <motion.div 
        layout 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glow-card" 
        style={{ borderRadius: '32px', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr' }}
    >
      {/* Left: Visual Evidence & Meta */}
      <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
        {item.image_url ? (
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#444', fontWeight: 800 }}>No Visual Evidence</span>
            </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{item.upvotes}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <MapPin size={16} />
                    {item.location_text || 'Nearby Location'}
                </div>
            </div>
        </div>
      </div>

      {/* Right: Decision Panel */}
      <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{item.title}</h4>
                <div style={{ padding: '0.4rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>APPROVED</div>
           </div>
           <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.6' }}>{item.description}</p>
        </div>

        {/* Admin Message - Pass from Validator */}
        <div style={{ padding: '1.5rem', background: 'rgba(124, 58, 237, 0.08)', borderRadius: '20px', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
            <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={14} /> INTERNAL NOTE FROM ADMIN
            </div>
            <p style={{ color: 'white', fontWeight: 500, fontSize: '0.95rem', fontStyle: item.admin_message ? 'normal' : 'italic' }}>
                {item.admin_message || 'The admin did not provide any specific instructions for this report.'}
            </p>
        </div>

        {/* Dispatch Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}><Layers size={14} /> Category</label>
            <select style={inputStyle} value={data.category} onChange={e => setData({...data, category: e.target.value})}>
              <option>Infrastructure</option>
              <option>Sanitation</option>
              <option>Safety</option>
              <option>Public Works</option>
              <option>Transportation</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}><Flag size={14} /> Priority</label>
            <select style={inputStyle} value={data.priority} onChange={e => setData({...data, priority: e.target.value})}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <label style={labelStyle}><Home size={14} /> Target Department</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select style={{ ...inputStyle, flex: 1 }} value={data.department} onChange={e => setData({...data, department: e.target.value})}>
                <option>PWD</option>
                <option>Municipal Health</option>
                <option>Police Department</option>
                <option>Electricity Board</option>
                <option>Fire & Safety</option>
            </select>
            <button onClick={() => onAssign(item._id, data)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <UserPlus size={18} /> Confirm Dispatch
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const labelStyle = { color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: 600, letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '14px', color: 'white', outline: 'none', transition: 'all 0.2s' };

export default MediatorDashboard;
