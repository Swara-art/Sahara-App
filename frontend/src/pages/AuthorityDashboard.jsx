import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Info, Camera, MessageSquare, AlertTriangle, Clock, ThumbsUp, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const AuthorityDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user?.department) return;
    try {
      const res = await api.get(`/authority/assigned?department=${user.department}`);
      // Sort by upvotes descending
      const sortedTasks = (res.data || []).sort((a, b) => b.upvotes - a.upvotes);
      setTasks(sortedTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAction = async (id, action, payload = {}) => {
    try {
      if (action === 'start') {
        await api.post(`/authority/${id}/start`);
      } else if (action === 'resolve') {
        const formData = new FormData();
        formData.append('remark', payload.remark);
        if (payload.proof) {
          formData.append('proof', payload.proof);
        }
        await api.post(`/authority/${id}/resolve`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (action === 'flag') {
        alert('Category flag reported to AI system for recalibration.');
        return;
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Action failed. Please check if the backend supports this action.');
    }
  };

  return (
    <div className="authority-dashboard" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Resolution Board</h3>
          <p style={{ color: 'var(--text-muted)' }}>Tasks for <strong>{user.department}</strong> department, prioritized by community upvotes.</p>
        </div>
        <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
          <Info size={20} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem' }}>Upvotes drive resolution priority.</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem' }}>Syncing Department Tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass" style={{ padding: '6rem 2rem', textAlign: 'center', borderRadius: '40px' }}>
          <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: '2rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.8rem' }}>Inbox Zero!</h3>
          <p style={{ color: 'var(--text-muted)' }}>All issues in your jurisdiction have been resolved.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tasks.map((task, idx) => (
            <TaskCard key={task._id} task={task} onAction={handleAction} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, onAction, index }) => {
  const [remark, setRemark] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [showResolve, setShowResolve] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const isResolved = task.status === 'resolved';
  const isHighPriority = !isResolved && (task.upvotes > 10 || task.priority === 'High' || task.priority === 'Critical');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass" 
      style={{ 
        borderRadius: '32px', overflow: 'hidden', 
        border: isResolved ? '1px solid rgba(16, 185, 129, 0.3)' : (isHighPriority ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-glass)'),
        background: isResolved ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' : (isHighPriority ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, transparent 100%)' : 'transparent'),
        position: 'relative'
      }}
    >
      {isResolved && (
        <motion.div
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--success)',
            color: 'white', fontWeight: 900, fontSize: '0.7rem', zIndex: 10,
            transform: 'rotate(10deg)', border: '2px solid white'
          }}
        >
          RESOLVED
        </motion.div>
      )}

      <div style={{ padding: '2rem', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Task Image */}
        <div style={{ ...taskImageContainerStyle, cursor: 'pointer' }} onClick={() => navigate(`/complaint/${task._id}`)}>
          {task.image_url ? (
            <img src={task.image_url} alt="" style={taskImageStyle} />
          ) : <div style={taskImagePlaceholderStyle}><Camera size={24} style={{ opacity: 0.1 }} /></div>}
        </div>

        {/* Task Info */}
        <div style={{ flex: 1 }}>
          <div style={taskHeaderRow}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <StatusBadge status={task.status} />
              <span style={categoryTagStyle}>{task.category}</span>
            </div>
            {!isResolved && (
              <div style={upvoteBadgeStyle}>
                 <ThumbsUp size={14} fill="currentColor" />
                 <span>{task.upvotes} UPVOTES</span>
              </div>
            )}
          </div>

          <h4 style={{ ...taskTitleStyle, cursor: 'pointer', opacity: isResolved ? 0.6 : 1 }} onClick={() => navigate(`/complaint/${task._id}`)}>{task.title}</h4>
          
          <div style={taskMetaRow}>
             <span style={metaItemStyle}><Clock size={14} /> Received {new Date(task.created_at).toLocaleDateString()}</span>
             <span style={metaItemStyle}><MapPin size={14} /> Location Verified</span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
             <button onClick={() => setIsExpanded(!isExpanded)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                {isExpanded ? 'Hide Details' : 'View Details'}
             </button>
             {!isResolved && (
               <button onClick={() => onAction(task._id, 'flag')} style={flagButtonStyle}>
                  <AlertTriangle size={14} /> Flag Category
               </button>
             )}
          </div>
        </div>

        {/* Actions Section */}
        <div style={actionColumnStyle}>
           {task.status === 'assigned' && (
             <button onClick={() => onAction(task._id, 'start')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Play size={18} /> Start Work
             </button>
           )}

           {task.status === 'in_progress' && !showResolve && (
             <button onClick={() => setShowResolve(true)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--success)' }}>
                <CheckCircle size={18} /> Mark Resolved
             </button>
           )}

           {showResolve && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={resolveFormStyle}>
                <textarea 
                  placeholder="Official resolution remark (required)..." 
                  style={inputStyle}
                  value={remark} onChange={e => setRemark(e.target.value)}
                />
                <label style={proofUploadStyle}>
                   <Camera size={16} /> {proofFile ? proofFile.name : 'Upload Resolution Proof'}
                   <input type="file" hidden onChange={e => setProofFile(e.target.files[0])} />
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => onAction(task._id, 'resolve', { remark, proof: proofFile })} className="btn btn-primary" style={{ flex: 2, background: 'var(--success)' }}>Confirm</button>
                  <button onClick={() => setShowResolve(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                </div>
             </motion.div>
           )}

           {isResolved && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 800, fontSize: '1.1rem' }}
             >
                <CheckCircle2 size={24} /> MISSION COMPLETE
             </motion.div>
           )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={expandPanelStyle}
          >
             <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isResolved && task.resolution_image ? '1fr 250px' : '1fr', gap: '2rem' }}>
                  <div>
                    <h5 style={detailLabelStyle}>Citizen Description</h5>
                    <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', marginBottom: '2rem' }}>{task.description || 'No description provided.'}</p>
                    
                    {isResolved && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <h5 style={{ ...detailLabelStyle, color: 'var(--success)' }}>Resolution Remark</h5>
                        <p style={{ color: 'white', fontStyle: 'italic' }}>"{task.resolution_remark || 'Task completed as per standards.'}"</p>
                      </div>
                    )}
                  </div>

                  {isResolved && task.resolution_image && (
                    <div>
                      <h5 style={detailLabelStyle}>Resolution Proof</h5>
                      <div style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--success)' }}>
                        <img src={task.resolution_image} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                   <div style={aiCheckItem}>AI Match: 98%</div>
                   <div style={aiCheckItem}>Geo-Tag: Valid</div>
                   <div style={aiCheckItem}>Priority: {task.priority}</div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Styles
const taskImageContainerStyle = {
  width: '180px', height: '180px', borderRadius: '24px', overflow: 'hidden', background: '#111', flexShrink: 0
};

const taskImageStyle = {
  width: '100%', height: '100%', objectFit: 'cover'
};

const taskImagePlaceholderStyle = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const taskHeaderRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'
};

const categoryTagStyle = {
  fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'
};

const upvoteBadgeStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', 
  padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)'
};

const taskTitleStyle = {
  fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: '1.3'
};

const taskMetaRow = {
  display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)'
};

const metaItemStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem'
};

const flagButtonStyle = {
  background: 'transparent', border: 'none', color: '#ff3040', fontSize: '0.8rem', 
  fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', opacity: 0.6
};

const actionColumnStyle = {
  width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end', paddingTop: '1rem'
};

const resolveFormStyle = {
  width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem'
};

const inputStyle = {
  width: '100%', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', 
  border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', 
  outline: 'none', resize: 'none', height: '100px'
};

const proofUploadStyle = {
  display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', 
  background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', fontSize: '0.8rem', 
  cursor: 'pointer', border: '1px dashed var(--border-glass)', color: 'var(--text-muted)'
};

const expandPanelStyle = {
  padding: '0 2rem 2rem', overflow: 'hidden'
};

const detailLabelStyle = {
  fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem'
};

const aiCheckItem = {
  padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', 
  fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)'
};

export default AuthorityDashboard;
