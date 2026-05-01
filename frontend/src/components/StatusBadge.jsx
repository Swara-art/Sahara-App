import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Awaiting AI', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
    approved: { label: 'Verified', color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.1)' },
    assigned: { label: 'Assigned', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
    in_progress: { label: 'In Progress', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    resolved: { label: 'Resolved', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
    rejected: { label: 'Rejected', color: '#ff3040', bg: 'rgba(255, 48, 64, 0.1)' }
  };

  const { label, color, bg } = config[status] || { label: status, color: '#999', bg: 'rgba(255,255,255,0.05)' };

  return (
    <span style={{ 
      padding: '0.4rem 0.8rem', 
      borderRadius: '8px', 
      fontSize: '0.75rem', 
      fontWeight: 800, 
      textTransform: 'uppercase', 
      letterSpacing: '0.5px',
      color: color,
      background: bg,
      border: `1px solid ${color}33`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
};

export default StatusBadge;
