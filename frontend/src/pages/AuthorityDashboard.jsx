import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Info, Camera, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AuthorityDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.department) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/authority/assigned?department=${user.department}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, remark = '') => {
    if (action === 'resolve' && !remark.trim()) {
      alert('Please provide a resolution remark or proof description.');
      return;
    }
    try {
      if (action === 'start') {
        await api.post(`/authority/${id}/start`);
      } else {
        await api.post(`/authority/${id}/resolve?remark=${remark}`);
      }
      fetchTasks();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="authority-dashboard">
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem' }}>Department Tasks (Execution Role)</h3>
        <p style={{ color: 'var(--text-muted)' }}>Manage and resolve issues assigned to the {user.department} department.</p>
      </div>

      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
        <Info size={20} style={{ color: 'var(--success)' }} />
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
          Update tasks to **In Progress** when starting work. Provide detailed **Remarks** and proof when marking as **Resolved**.
        </p>
      </div>

      {loading ? (
        <div>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
          <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
          <h3>No pending tasks!</h3>
          <p style={{ color: 'var(--text-muted)' }}>All issues in your department have been addressed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, onAction }) => {
  const [remark, setRemark] = useState('');
  const [showResolve, setShowResolve] = useState(false);

  return (
    <motion.div layout className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>#{task._id.slice(-6)}</span>
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', background: task.priority === 'High' || task.priority === 'Critical' ? 'var(--danger)' : 'var(--accent-blue)', fontSize: '0.7rem', fontWeight: 600 }}>
            {task.priority.toUpperCase()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{task.category}</span>
        </div>
        <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{task.title}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{task.description}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {task.status === 'assigned' && (
          <button onClick={() => onAction(task._id, 'start')} className="btn btn-primary">
            <Play size={18} /> Start Work
          </button>
        )}
        
        {task.status === 'in_progress' && !showResolve && (
          <button onClick={() => setShowResolve(true)} className="btn btn-primary" style={{ background: 'var(--success)', boxShadow: 'none' }}>
            <CheckCircle size={18} /> Resolve Issue
          </button>
        )}

        {showResolve && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '300px' }}>
            <textarea 
              placeholder="Add resolution remarks (required)..." 
              style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
              value={remark} onChange={e => setRemark(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => onAction(task._id, 'resolve', remark)} className="btn btn-primary" style={{ flex: 2, background: 'var(--success)' }}>Confirm Resolve</button>
              <button onClick={() => setShowResolve(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </motion.div>
        )}

        {task.status === 'resolved' && (
          <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <CheckCircle size={20} /> Resolved
          </div>
        )}
      </div>
    </motion.div>
  );
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

export default AuthorityDashboard;

