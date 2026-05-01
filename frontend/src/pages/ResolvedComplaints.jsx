import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Clock, ArrowLeft, Image as ImageIcon, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ResolvedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchResolved();
  }, []);

  const fetchResolved = async () => {
    try {
      // Fetching all complaints and filtering for resolved
      // In a real system, there would be a specific endpoint for this
      const res = await api.get('/complaints?lat=19.076&lng=72.877');
      const resolved = (res.data.data || []).filter(c => c.status === 'resolved');
      setComplaints(resolved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(filter.toLowerCase()) || 
    c.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="resolved-page" style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '4rem 2rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '3rem', fontWeight: 700 }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '5rem', textAlign: 'center' }}>
           <div style={iconBadgeStyle}><CheckCircle2 size={48} color="var(--success)" /></div>
           <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>Impact Gallery</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
             Transparency in action. Explore how we've worked together to resolve over {complaints.length} community issues.
           </p>
        </div>

        {/* Search/Filter Bar */}
        <div className="glass" style={searchBarContainer}>
           <Search size={20} style={{ opacity: 0.3 }} />
           <input 
             type="text" placeholder="Search by issue type or location..." 
             style={searchInputStyle}
             value={filter} onChange={e => setFilter(e.target.value)}
           />
        </div>

        {/* Impact Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '10rem' }}>Loading Impact Data...</div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '10rem', opacity: 0.5 }}>No resolved issues found matching your search.</div>
        ) : (
          <div style={impactGridStyle}>
            {filteredComplaints.map((comp, idx) => (
              <ImpactCard key={comp._id} complaint={comp} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ImpactCard = ({ complaint, index }) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.1 }}
      onClick={() => navigate(`/complaint/${complaint._id}`)}
      className="glass" 
      style={{ ...impactCardStyle, cursor: 'pointer' }}
    >
    <div style={imageContainerStyle}>
       {complaint.image_url ? (
         <img src={complaint.image_url} alt="" style={imageStyle} />
       ) : <div style={placeholderStyle}><ImageIcon size={32} /></div>}
       <div style={categoryOverlay}>{complaint.category}</div>
    </div>

    <div style={{ padding: '2rem' }}>
       <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>{complaint.title}</h4>
       <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> Nearby</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> Resolved {new Date(complaint.updated_at || complaint.created_at).toLocaleDateString()}</span>
       </div>
       
       <div style={resolutionBoxStyle}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--success)' }}>Resolution Result</div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>
             {complaint.logs?.find(l => l.status === 'resolved')?.remark || 'Issue has been successfully addressed by authorities.'}
          </p>
       </div>
    </div>
    </motion.div>
  );
};

// Styles
const iconBadgeStyle = {
  width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
  border: '1px solid rgba(16, 185, 129, 0.2)'
};

const searchBarContainer = {
  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', 
  borderRadius: '20px', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem'
};

const searchInputStyle = {
  background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '1.1rem'
};

const impactGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2.5rem'
};

const impactCardStyle = {
  borderRadius: '32px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column'
};

const imageContainerStyle = {
  height: '240px', background: '#111', position: 'relative'
};

const imageStyle = {
  width: '100%', height: '100%', objectFit: 'cover'
};

const placeholderStyle = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1
};

const categoryOverlay = {
  position: 'absolute', bottom: '1rem', right: '1rem', padding: '0.4rem 0.8rem', 
  borderRadius: '8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', 
  fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
};

const resolutionBoxStyle = {
  padding: '1.2rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)'
};

export default ResolvedComplaints;
