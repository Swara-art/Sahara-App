import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Clock, CheckCircle, AlertCircle, 
  MapPin, Plus, List, Image as ImageIcon, Send
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyActivity = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get('/profile');
      setComplaints(res.data.my_complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-activity">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h3 style={{ fontSize: '1.8rem' }}>My Activity</h3>
          <p style={{ color: 'var(--text-muted)' }}>Track the progress of your reported issues</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
          <Plus size={20} /> Report New Issue
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Loading your reports...</div>
      ) : complaints.length === 0 ? (
        <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '32px' }}>
          <List size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <h3>No reports yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Every report helps make your community safer.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-outline">Start your first report</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {complaints.map(comp => (
            <ActivityCard 
              key={comp._id} 
              complaint={comp} 
              isExpanded={selectedId === comp._id}
              onToggle={() => setSelectedId(selectedId === comp._id ? null : comp._id)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <ReportModal onClose={() => setIsModalOpen(false)} onRefresh={fetchMyComplaints} />
        )}
      </AnimatePresence>
    </div>
  );
};

const ActivityCard = ({ complaint, isExpanded, onToggle }) => {
  return (
    <motion.div 
      layout
      className="glass" 
      style={{ borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border-glass)' }}
      onClick={onToggle}
    >
      <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', overflow: 'hidden', background: '#111' }}>
            {complaint.image_url ? (
              <img src={complaint.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} opacity={0.2} /></div>}
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{complaint.title}</h4>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> {complaint.location_text || 'Nearby'}</span>
              <span>•</span>
              <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ 
            padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, 
            background: getStatusColor(complaint.status) + '22', color: getStatusColor(complaint.status),
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            {complaint.status}
          </span>
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
            <ChevronRight size={20} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ padding: '0 2rem 2rem', borderTop: '1px solid var(--border-glass)' }}
          >
            <div style={{ paddingTop: '2rem' }}>
              <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>{complaint.description}</p>
              
              <h5 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Complaint Lifecycle</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '11px', top: '20px', bottom: '20px', width: '2px', background: 'var(--border-glass)' }} />
                {(complaint.logs || []).map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', background: '#000', border: '2px solid ' + getStatusColor(log.status),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                    }}>
                      {i === (complaint.logs?.length - 1) ? <CheckCircle size={14} color={getStatusColor(log.status)} /> : <Clock size={12} color="var(--text-muted)" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: getStatusColor(log.status), textTransform: 'capitalize' }}>{log.status}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.time).toLocaleString()}</div>
                      {log.remark && <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.9rem' }}>{log.remark}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ... ReportModal (Same as in CitizenDashboard, moved here for cleaner architecture)
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
                <MapPin size={14} /> Coordinates: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
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
    case 'rejected': return 'var(--danger)';
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

export default MyActivity;
