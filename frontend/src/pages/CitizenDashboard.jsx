import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, ThumbsUp, Filter, Search, ChevronDown, Clock, BarChart2, User, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ComplaintForm from '../components/ComplaintForm';
import StatusBadge from '../components/StatusBadge';

const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState({ lat: 19.076, lng: 72.877 }); // Default fallback
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const fetchLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/complaints?lat=${userLoc.lat}&lng=${userLoc.lng}`;
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.status) url += `&status=${filters.status}`;
      
      const res = await api.get(url);
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userLoc, filters]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleUpvote = async (id) => {
    try {
      await api.post(`/complaint/${id}/upvote?lat=${userLoc.lat}&lng=${userLoc.lng}`);
      // Optimistic update or just refetch
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Upvote failed. You might be too far away.');
    }
  };

  const categories = ['Pothole', 'Garbage', 'Street Light', 'Water Leak', 'Encroachment', 'Other'];
  const statuses = ['pending', 'approved', 'assigned', 'in_progress', 'resolved', 'rejected'];

  return (
    <div className="citizen-dashboard" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={headerSectionStyle}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Community Feed</h2>
          <p style={{ color: 'var(--text-muted)' }}>Showing verified issues within 5km of your location</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="btn btn-outline"
            style={{ borderColor: showFilters ? 'var(--primary)' : 'var(--border-glass)' }}
          >
            <Filter size={18} /> Filters
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '16px' }}>
            <Plus size={20} /> Report Issue
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={filterPanelStyle}
          >
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>Category</label>
                <select 
                  style={selectStyle} 
                  value={filters.category}
                  onChange={e => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>Status</label>
                <select 
                  style={selectStyle} 
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ alignSelf: 'flex-end', padding: '0.6rem 1.2rem' }}
                onClick={() => setFilters({ category: '', status: '' })}
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed Grid */}
      <div style={feedGridStyle}>
        {loading ? (
          <div style={emptyStateStyle}>
            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h3>Syncing with Community Hub...</h3>
          </div>
        ) : complaints.length === 0 ? (
          <div style={emptyStateStyle}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>No complaints found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or be the first to report!</p>
          </div>
        ) : (
          complaints.map(complaint => (
            <ComplaintCard 
              key={complaint._id} 
              complaint={complaint} 
              onUpvote={() => handleUpvote(complaint._id)} 
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ComplaintForm onClose={() => setIsModalOpen(false)} onRefresh={fetchComplaints} />
        )}
      </AnimatePresence>
    </div>
  );
};

const ComplaintCard = ({ complaint, onUpvote }) => {
  const isPriority = complaint.priority === 'High' || complaint.priority === 'Critical';
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/complaint/${complaint._id}`)}
      className="glass" 
      style={{ ...cardStyle, cursor: 'pointer' }}
    >
      {/* Card Media */}
      <div style={cardMediaStyle}>
        {complaint.image_url ? (
          <img src={complaint.image_url} alt={complaint.title} style={imageStyle} />
        ) : (
          <div style={imagePlaceholderStyle}>No Image Provided</div>
        )}
        <div style={cardBadgeOverlay}>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Card Content */}
      <div style={cardContentStyle}>
        <div style={cardHeaderRow}>
          <span style={{ ...categoryBadgeStyle, background: isPriority ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', color: isPriority ? '#ef4444' : 'var(--text-muted)' }}>
            {complaint.category} • {complaint.priority}
          </span>
          <span style={distanceStyle}>
            <MapPin size={12} /> {(complaint.distance_km || 0).toFixed(1)} km away
          </span>
        </div>

        <h4 style={cardTitleStyle}>{complaint.title}</h4>
        
        <div style={cardStatsRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Clock size={14} /> {new Date(complaint.created_at).toLocaleDateString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <button 
              onClick={(e) => { e.stopPropagation(); onUpvote(); }}
              style={{ ...upvoteButtonStyle, color: complaint.has_upvoted ? '#ff3040' : '#fff' }}
             >
               <ThumbsUp size={18} fill={complaint.has_upvoted ? 'currentColor' : 'none'} />
               <span>{complaint.upvotes}</span>
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Styles
const headerSectionStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem'
};

const filterPanelStyle = {
  background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)',
  borderRadius: '24px', padding: '1.5rem 2rem', marginBottom: '3rem', overflow: 'hidden'
};

const filterGroupStyle = {
  display: 'flex', flexDirection: 'column', gap: '0.5rem'
};

const filterLabelStyle = {
  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'
};

const selectStyle = {
  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)',
  borderRadius: '10px', color: '#fff', padding: '0.5rem 1rem', outline: 'none', minWidth: '180px'
};

const feedGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem'
};

const cardStyle = {
  borderRadius: '24px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
  border: '1px solid var(--border-glass)', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};

const cardMediaStyle = {
  height: '220px', width: '100%', position: 'relative', background: '#111'
};

const imageStyle = {
  width: '100%', height: '100%', objectFit: 'cover'
};

const imagePlaceholderStyle = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333'
};

const cardBadgeOverlay = {
  position: 'absolute', top: '1rem', left: '1rem'
};

const cardContentStyle = {
  padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column'
};

const cardHeaderRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'
};

const categoryBadgeStyle = {
  fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase'
};

const distanceStyle = {
  fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600
};

const cardTitleStyle = {
  fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: '1.4'
};

const cardStatsRow = {
  marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)'
};

const upvoteButtonStyle = {
  background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px',
  padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
  cursor: 'pointer', transition: '0.2s', fontWeight: 700
};

const emptyStateStyle = {
  gridColumn: '1 / -1', textAlign: 'center', padding: '8rem 2rem', opacity: 0.8
};



export default CitizenDashboard;
