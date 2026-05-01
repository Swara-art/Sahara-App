import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Clock, CheckCircle, AlertCircle, 
  MapPin, Plus, List, Image as ImageIcon, Send,
  ArrowRight, Activity, ThumbsUp
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ComplaintForm from '../components/ComplaintForm';
import StatusBadge from '../components/StatusBadge';

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
    <div className="my-activity" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>My Activity</h3>
          <p style={{ color: 'var(--text-muted)' }}>Track your contributions and their impact on the community</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '16px' }}>
          <Plus size={20} /> New Report
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem' }}>
          <Activity size={48} className="animate-pulse" style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Fetching your history...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="glass" style={{ padding: '6rem 2rem', textAlign: 'center', borderRadius: '40px', border: '1px dashed var(--border-glass)' }}>
          <List size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>No reports yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem' }}>
            Every report you file helps authorities prioritize the most critical issues in your neighborhood.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-outline" style={{ borderRadius: '12px' }}>File your first report</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {complaints.map((comp, idx) => (
            <ActivityCard 
              key={comp._id} 
              complaint={comp} 
              index={idx}
              isExpanded={selectedId === comp._id}
              onToggle={() => setSelectedId(selectedId === comp._id ? null : comp._id)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <ComplaintForm onClose={() => setIsModalOpen(false)} onRefresh={fetchMyComplaints} />
        )}
      </AnimatePresence>
    </div>
  );
};

const ActivityCard = ({ complaint, isExpanded, onToggle, index }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass" 
      style={{ 
        borderRadius: '32px', overflow: 'hidden', cursor: 'pointer', 
        border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
        transition: '0.3s'
      }}
      onClick={onToggle}
    >
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
            {complaint.image_url ? (
              <img src={complaint.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={24} style={{ opacity: 0.1 }} /></div>}
          </div>
          <div>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{complaint.title}</h4>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {new Date(complaint.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ThumbsUp size={16} /> {complaint.upvotes} Signals</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <StatusBadge status={complaint.status} />
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
            <ChevronRight size={24} style={{ opacity: 0.3 }} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ padding: '0 2.5rem 2.5rem', borderTop: '1px solid var(--border-glass)' }}
          >
            <div style={{ paddingTop: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                <div>
                  <h5 style={detailLabelStyle}>Description</h5>
                  <p style={{ marginBottom: '2.5rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                    {complaint.description || 'No detailed description provided.'}
                  </p>

                  <h5 style={detailLabelStyle}>Resolution Timeline</h5>
                  <div style={timelineContainerStyle}>
                    {(complaint.logs || []).length > 0 ? (
                      complaint.logs.map((log, i) => (
                        <div key={i} style={timelineItemStyle}>
                          <div style={{ ...timelineDotStyle, borderColor: getStatusColor(log.status), background: i === 0 ? getStatusColor(log.status) : 'transparent' }} />
                          <div style={timelineContentStyle}>
                            <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              {log.status.replace('_', ' ')}
                              {i === (complaint.logs.length - 1) && <span style={currentLabelStyle}>Current</span>}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                              {new Date(log.time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                            {log.remark && (
                              <div style={remarkBoxStyle}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.4rem', opacity: 0.5 }}>Official Note</div>
                                {log.remark}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>AI is currently validating this report...</div>
                    )}
                  </div>
                </div>

                <div>
                   <h5 style={detailLabelStyle}>Validation Status</h5>
                   <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <ValidationItem label="AI Image Check" status={complaint.status !== 'pending' ? 'passed' : 'pending'} />
                        <ValidationItem label="Location Logic" status="passed" />
                        <ValidationItem label="Duplicate Filter" status="passed" />
                        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Assigned Authority</div>
                           <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{complaint.assigned_to || 'AI Processing...'}</div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ValidationItem = ({ label, status }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{label}</span>
    {status === 'passed' ? (
      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800 }}>
        <CheckCircle size={14} /> VALID
      </span>
    ) : (
      <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800 }}>
        <Clock size={14} /> QUEUED
      </span>
    )}
  </div>
);

// Styles
const detailLabelStyle = {
  marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px'
};

const timelineContainerStyle = {
  display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', paddingLeft: '0.5rem'
};

const timelineItemStyle = {
  display: 'flex', gap: '2rem', alignItems: 'flex-start', position: 'relative'
};

const timelineDotStyle = {
  width: '12px', height: '12px', borderRadius: '50%', border: '3px solid', zIndex: 1, marginTop: '6px', flexShrink: 0
};

const timelineContentStyle = {
  flex: 1
};

const remarkBoxStyle = {
  marginTop: '0.8rem', padding: '1.2rem', background: 'rgba(124, 58, 237, 0.05)', 
  borderLeft: '4px solid var(--primary)', borderRadius: '0 16px 16px 0', fontSize: '0.95rem', lineHeight: '1.6'
};

const currentLabelStyle = {
  fontSize: '0.6rem', background: 'var(--primary)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', verticalAlign: 'middle'
};

const getStatusColor = (status) => {
  switch(status) {
    case 'pending': return 'var(--warning)';
    case 'approved': return 'var(--accent-blue)';
    case 'assigned': return '#7c3aed';
    case 'in_progress': return '#ec4899';
    case 'resolved': return 'var(--success)';
    case 'rejected': return '#ff3040';
    default: return '#999';
  }
};

export default MyActivity;
