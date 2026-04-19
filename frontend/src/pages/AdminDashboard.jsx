import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/pending');
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, reason = '') => {
    try {
      if (action === 'approve') {
        await api.post(`/admin/${id}/approve`);
      } else {
        await api.post(`/admin/${id}/reject?reason=${reason}`);
      }
      fetchPending();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="admin-dashboard">
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem' }}>Review Queue</h3>
        <p style={{ color: 'var(--text-muted)' }}>Approve or reject community reports</p>
      </div>

      {loading ? (
        <div>Loading queue...</div>
      ) : pending.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
          <Check size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
          <h3>All clear!</h3>
          <p style={{ color: 'var(--text-muted)' }}>No pending complaints to review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pending.map(item => (
            <AdminCard key={item._id} item={item} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminCard = ({ item, onAction }) => {
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  return (
    <motion.div layout className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', gap: '2rem' }}>
      <div style={{ width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', background: '#222' }}>
        {item.image_url ? (
          <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>No Image</div>
        )}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: '1.25rem' }}>{item.title}</h4>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>User ID: {item.user_id}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{item.description}</p>
        
        {!showReject ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => onAction(item._id, 'approve')} className="btn btn-primary" style={{ background: 'var(--success)', boxShadow: 'none' }}>
              <Check size={18} /> Approve
            </button>
            <button onClick={() => setShowReject(true)} className="btn btn-outline" style={{ color: 'var(--danger)' }}>
              <X size={18} /> Reject
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" placeholder="Reason for rejection..." 
              style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--danger)', borderRadius: '12px', color: 'white' }}
              value={reason} onChange={e => setReason(e.target.value)}
            />
            <button onClick={() => onAction(item._id, 'reject', reason)} className="btn btn-primary" style={{ background: 'var(--danger)' }}>Confirm Reject</button>
            <button onClick={() => setShowReject(false)} className="btn btn-outline">Cancel</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
