import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, ThumbsUp, Send, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';

const CitizenDashboard = ({ view = 'feed' }) => {
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // For now, getting all with a default location
      const res = await api.get('/complaints?lat=19.076&lng=72.877');
      setComplaints(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      await api.post(`/complaint/${id}/upvote?lat=19.076&lng=72.877`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot upvote');
    }
  };

  return (
    <div className="citizen-dashboard">
      {view !== 'rewards' ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Community Feed</h3>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={20} /> New Post
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading feed...</div>
            ) : complaints.map(complaint => (
              <ComplaintCard 
                key={complaint._id} 
                complaint={complaint} 
                onUpvote={() => handleUpvote(complaint._id)} 
              />
            ))}
          </div>
        </div>
      ) : (
        <RewardsView />
      )}


      <AnimatePresence>
        {isModalOpen && (
          <ReportModal onClose={() => setIsModalOpen(false)} onRefresh={fetchComplaints} />
        )}
      </AnimatePresence>
    </div>
  );
};

const RewardsView = () => {
  const [vouchers, setVouchers] = useState([]);
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    fetchVouchers();
    fetchProfile();
  }, []);

  const fetchVouchers = async () => {
    const res = await api.get('/vouchers');
    setVouchers(res.data);
  };

  const fetchProfile = async () => {
    const res = await api.get('/profile');
    setTokens(res.data.tokens);
  };

  const handleBuy = async (id) => {
    try {
      await api.post(`/vouchers/buy/${id}`);
      fetchProfile();
      alert('Voucher purchased!');
    } catch (err) {
      alert('Not enough tokens');
    }
  };

  return (
    <div className="rewards-view">
      <div className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem' }}>My Tokens</h3>
          <p style={{ color: 'var(--text-muted)' }}>Contribute more to earn rewards</p>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{tokens}</div>
      </div>

      <h3 style={{ marginBottom: '1.5rem' }}>Available Vouchers</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {vouchers.map(v => (
          <div key={v._id} className="glass" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{v.name}</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{v.description}</p>
            <button onClick={() => handleBuy(v._id)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Buy for {v.cost} tokens
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


const ComplaintCard = ({ complaint, onUpvote }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass" 
    style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}
  >
    {/* Header */}
    <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
          {complaint.user_id.slice(-2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{complaint.user_id.slice(-8)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <MapPin size={10} /> {complaint.location_text || 'Nearby'} • {complaint.distance_km}km
          </div>
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: getStatusColor(complaint.status), fontWeight: 700, textTransform: 'uppercase' }}>
        {complaint.status}
      </div>
    </div>

    {/* Media */}
    <div style={{ background: '#111', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {complaint.image_url ? (
        <img src={complaint.image_url} alt="post" style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }} />
      ) : (
        <div style={{ color: '#333', textAlign: 'center' }}>
          <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
          <p style={{ opacity: 0.2 }}>No media attached</p>
        </div>
      )}
    </div>

    {/* Actions */}
    <div style={{ padding: '1rem 1rem 0.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onUpvote}
          style={{ background: 'transparent', border: 'none', color: complaint.has_upvoted ? '#ff3040' : 'white', cursor: 'pointer', padding: 0 }}
        >
          <ThumbsUp size={24} fill={complaint.has_upvoted ? 'currentColor' : 'none'} />
        </motion.button>
        <Send size={24} style={{ cursor: 'pointer', opacity: 0.8 }} />
      </div>
      
      <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        {complaint.upvotes} upvotes
      </div>

      <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
        <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{complaint.title}</span>
        <span style={{ color: 'var(--text-muted)' }}>{complaint.description}</span>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem', textTransform: 'uppercase' }}>
        {new Date(complaint.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
      </div>
    </div>
  </motion.div>
);


const ReportModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({ title: '', description: '', lat: 19.076, lng: 72.877, location_text: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
      });
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);
      data.append('location_text', formData.location_text);
      if (file) data.append('image', file);

      await api.post('/complaint', data);

      onRefresh();
      onClose();
    } catch (err) {
      alert('Failed to report issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass" 
        style={{ width: '100%', maxWidth: '600px', borderRadius: '32px', padding: '2.5rem' }}
      >
        <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Report Community Issue</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="text" placeholder="Issue Title (e.g. Broken Street Light)" required 
            style={inputStyle} onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <textarea 
            placeholder="Describe the problem in detail..." required 
            style={{ ...inputStyle, minHeight: '120px', resize: 'none' }}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <input 
            type="text" placeholder="Location Landmark" required 
            style={inputStyle} onChange={e => setFormData({...formData, location_text: e.target.value})}
          />
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}>
              <ImageIcon size={20} /> {file ? file.name : 'Upload Photo'}
              <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
            </label>
            <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <MapPin size={14} /> Coordinates: {formData.lat}, {formData.lng}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
              {submitting ? 'Reporting...' : 'Submit Report'} <Send size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const getStatusColor = (status) => {
  switch(status) {
    case 'pending': return 'var(--warning)';
    case 'approved': return 'var(--accent-blue)';
    case 'assigned': return '#7c3aed';
    case 'in_progress': return '#ec4899';
    case 'resolved': return 'var(--success)';
    default: return 'var(--text-muted)';
  }
};

const inputStyle = {
  width: '100%',
  padding: '1rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-glass)',
  borderRadius: '12px',
  color: 'white',
  outline: 'none'
};

export default CitizenDashboard;
