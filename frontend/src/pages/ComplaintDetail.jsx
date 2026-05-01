import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, ThumbsUp, Shield, User, MessageSquare, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/complaint/${id}`);
      setComplaint(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '10rem' }}>Loading Details...</div>;
  if (!complaint) return <div style={{ textAlign: 'center', padding: '10rem' }}>Complaint not found.</div>;

  return (
    <div className="complaint-detail" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem' }}>
      <button onClick={() => navigate(-1)} style={backButtonStyle}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem' }}>
        {/* Left: Main Content */}
        <div>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <StatusBadge status={complaint.status} />
              <span style={categoryBadgeStyle}>{complaint.category}</span>
              <span style={priorityBadgeStyle(complaint.priority)}>{complaint.priority} Priority</span>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: '1.2', marginBottom: '1.5rem' }}>{complaint.title}</h1>
            <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '1rem' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MapPin size={18} /> Location Verified</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Clock size={18} /> Reported {new Date(complaint.created_at).toLocaleString()}</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><ThumbsUp size={18} /> {complaint.upvotes} Priority Signals</span>
            </div>
          </div>

          <div className="glass" style={imageHeroStyle}>
             {complaint.image_url ? (
               <img src={complaint.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
             ) : <div style={{ opacity: 0.2 }}><ImageIcon size={64} /></div>}
          </div>

          <div style={{ marginTop: '3rem' }}>
             <h3 style={sectionTitleStyle}>Issue Description</h3>
             <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.8)' }}>
                {complaint.description || 'No detailed description was provided by the reporter.'}
             </p>
          </div>

          {complaint.status === 'rejected' && (
             <div style={rejectionCardStyle}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                   <AlertCircle color="#ff3040" size={24} />
                   <h4 style={{ color: '#ff3040', fontWeight: 800 }}>AI Validation Failure</h4>
                </div>
                <p style={{ opacity: 0.8 }}>{complaint.rejection_reason || 'The submitted image or location did not match the community report parameters.'}</p>
             </div>
          )}
        </div>

        {/* Right: Timeline & Authority */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
           <div className="glass" style={timelineCardStyle}>
              <h3 style={{ ...sectionTitleStyle, marginBottom: '2.5rem' }}>Resolution Timeline</h3>
              <div style={timelineContainer}>
                 {complaint.logs?.map((log, i) => (
                    <div key={i} style={timelineItem}>
                       <div style={timelineDot(log.status)} />
                       <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', textTransform: 'capitalize' }}>{log.status.replace('_', ' ')}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{new Date(log.time).toLocaleString()}</div>
                          {log.remark && <div style={remarkStyle}>{log.remark}</div>}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
              <h3 style={{ ...sectionTitleStyle, marginBottom: '2rem' }}>Handling Authority</h3>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                 <div style={authorityAvatarStyle}><Shield size={24} color="var(--primary)" /></div>
                 <div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
  {complaint.department ? `${complaint.department.charAt(0).toUpperCase() + complaint.department.slice(1)} Department` : 'AI Assignment Pending'}
</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Government Department</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const backButtonStyle = {
  background: 'transparent', border: 'none', color: 'var(--text-muted)', 
  display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer',
  marginBottom: '3rem', fontSize: '1rem', fontWeight: 600, padding: 0
};

const categoryBadgeStyle = {
  fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'
};

const priorityBadgeStyle = (priority) => ({
  fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
  color: priority === 'High' || priority === 'Critical' ? '#ff3040' : 'var(--accent-blue)',
  background: priority === 'High' || priority === 'Critical' ? 'rgba(255, 48, 64, 0.1)' : 'rgba(59, 130, 246, 0.1)',
  padding: '0.2rem 0.6rem', borderRadius: '6px'
});

const imageHeroStyle = {
  height: '500px', borderRadius: '40px', overflow: 'hidden', background: '#111', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)'
};

const sectionTitleStyle = {
  fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', marginBottom: '2rem'
};

const rejectionCardStyle = {
  marginTop: '3rem', padding: '2rem', borderRadius: '24px', background: 'rgba(255, 48, 64, 0.05)', border: '1px solid rgba(255, 48, 64, 0.2)'
};

const timelineCardStyle = {
  padding: '3rem', borderRadius: '40px'
};

const timelineContainer = {
  display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative'
};

const timelineItem = {
  display: 'flex', gap: '2rem', position: 'relative'
};

const timelineDot = (status) => ({
  width: '14px', height: '14px', borderRadius: '50%', background: getStatusColor(status), 
  border: '4px solid rgba(255,255,255,0.1)', marginTop: '6px', zIndex: 1
});

const remarkStyle = {
  padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', 
  fontSize: '0.95rem', lineHeight: '1.6', borderLeft: '3px solid var(--primary)'
};

const authorityAvatarStyle = {
  width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(124, 58, 237, 0.1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
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

export default ComplaintDetail;
