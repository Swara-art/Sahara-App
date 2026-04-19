import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Layers, Flag, Home } from 'lucide-react';
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
      await api.post(`/mediator/${id}/assign?category=${data.category}&priority=${data.priority}&department=${data.department}`);
      fetchApproved();
    } catch (err) {
      alert('Assignment failed');
    }
  };

  return (
    <div className="mediator-dashboard">
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem' }}>Assignment Board</h3>
        <p style={{ color: 'var(--text-muted)' }}>Categorize and dispatch approved issues to departments</p>
      </div>

      {loading ? (
        <div>Loading approved issues...</div>
      ) : approved.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
          <h3>All caught up!</h3>
          <p style={{ color: 'var(--text-muted)' }}>No new approved complaints to assign.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
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
    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
      <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{item.title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>{item.description}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><Layers size={14} /> Category</label>
            <select style={inputStyle} value={data.category} onChange={e => setData({...data, category: e.target.value})}>
              <option>Infrastructure</option>
              <option>Sanitation</option>
              <option>Safety</option>
              <option>Public Works</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><Flag size={14} /> Priority</label>
            <select style={inputStyle} value={data.priority} onChange={e => setData({...data, priority: e.target.value})}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style={labelStyle}><Home size={14} /> Department</label>
          <select style={inputStyle} value={data.department} onChange={e => setData({...data, department: e.target.value})}>
            <option>PWD</option>
            <option>Municipal Health</option>
            <option>Police Department</option>
            <option>Electricity Board</option>
          </select>
        </div>

        <button onClick={() => onAssign(item._id, data)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
          <UserPlus size={18} /> Dispatch to Department
        </button>
      </div>
    </div>
  );
};

const labelStyle = { color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' };
const inputStyle = { width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white' };

export default MediatorDashboard;
