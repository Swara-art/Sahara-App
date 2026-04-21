import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertOctagon, Info } from 'lucide-react';
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

  const handleAction = async (id, action, reason = '', message = '') => {
    try {
      if (action === 'approve') {
        await api.post(`/admin/${id}/approve?message=${encodeURIComponent(message)}`);
      } else {
        await api.post(`/admin/${id}/reject?reason=${encodeURIComponent(reason)}`);
      }
      fetchPending();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="admin-dashboard">
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem' }}>Review Queue (Validator Role)</h3>
        <p style={{ color: 'var(--text-muted)' }}>Validate reports and filter spam. Note: Category and priority assignment is handled by Mediators.</p>
      </div>

      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
        <Info size={20} style={{ color: 'var(--accent-blue)' }} />
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
          Your role is to verify the legitimacy of reports. **Reject** clear spam or duplicates. **Approve** valid community issues for further routing.
        </p>
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
  const [message, setMessage] = useState('');
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
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>User ID: {item.user_id.slice(-8)}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{item.description}</p>
        
        {!showReject ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
               placeholder="Add a note for the Mediator (optional)..."
               style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', minHeight: '80px', resize: 'none' }}
               value={message} onChange={e => setMessage(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => onAction(item._id, 'approve', '', message)} className="btn btn-primary" style={{ background: 'var(--success)', boxShadow: 'none' }}>
                <Check size={18} /> Approve & Dispatch
              </button>
              <button onClick={() => setShowReject(true)} className="btn btn-outline" style={{ color: '#fff' }}>
                <X size={18} /> Reject / More Options
              </button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => onAction(item._id, 'reject', 'Spam/Duplicate')} className="btn-icon" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <AlertOctagon size={18} /> Reject as Spam
              </button>
              <button onClick={() => setShowReject(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" placeholder="Or enter custom rejection reason..." 
                style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white' }}
                value={reason} onChange={e => setReason(e.target.value)}
              />
              <button 
                onClick={() => onAction(item._id, 'reject', reason)} 
                disabled={!reason}
                className="btn btn-primary" 
                style={{ background: 'var(--danger)', padding: '0.8rem 1.5rem' }}
              >
                Reject Custom
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;

