import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, MessageSquare } from 'lucide-react';
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
        <h3 style={{ fontSize: '1.5rem' }}>Department Tasks</h3>
        <p style={{ color: 'var(--text-muted)' }}>Manage and resolve issues assigned to your department</p>
      </div>

      {loading ? (
        <div>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
          <h3>No tasks!</h3>
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
    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>#{task._id.slice(-6)}</span>
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', background: task.priority === 'High' ? 'var(--danger)' : 'var(--accent-blue)', fontSize: '0.7rem' }}>
            {task.priority.toUpperCase()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{task.category}</span>
        </div>
        <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{task.title}</h4>
        <p style={{ color: 'var(--text-muted)' }}>{task.description}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {task.status === 'assigned' && (
          <button onClick={() => onAction(task._id, 'start')} className="btn btn-primary">
            <Play size={18} /> Start Work
          </button>
        )}
        
        {task.status === 'in_progress' && !showResolve && (
          <button onClick={() => setShowResolve(true)} className="btn btn-primary" style={{ background: 'var(--success)' }}>
            <CheckCircle size={18} /> Resolve Issue
          </button>
        )}

        {showResolve && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" placeholder="Resolution remark..." 
              style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--success)', borderRadius: '12px', color: 'white' }}
              value={remark} onChange={e => setRemark(e.target.value)}
            />
            <button onClick={() => onAction(task._id, 'resolve', remark)} className="btn btn-primary" style={{ background: 'var(--success)' }}>Confirm</button>
            <button onClick={() => setShowResolve(false)} className="btn btn-outline">Cancel</button>
          </motion.div>
        )}

        {task.status === 'resolved' && (
          <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} /> Resolved
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
