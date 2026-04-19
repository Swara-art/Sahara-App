import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleUpvote } from '../api/api';
import './ComplaintCard.css';

const STATUS_LABELS = {
  pending:     { label: 'Pending',     cls: 'status-pending' },
  assigned:    { label: 'Assigned',    cls: 'status-assigned' },
  in_progress: { label: 'In Progress', cls: 'status-in_progress' },
  resolved:    { label: 'Resolved',    cls: 'status-resolved' },
};

export default function ComplaintCard({ complaint, userLat, userLng, onUpvoteChange }) {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  const [upvotes, setUpvotes] = useState(complaint.upvotes ?? 0);
  const [hasUpvoted, setHasUpvoted] = useState(complaint.has_upvoted ?? false);
  const [loading, setLoading] = useState(false);

  const statusInfo = STATUS_LABELS[complaint.status] || { label: complaint.status, cls: '' };

  async function handleUpvote() {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Optimistic update
    const wasUpvoted = hasUpvoted;
    setHasUpvoted(!wasUpvoted);
    setUpvotes((n) => n + (wasUpvoted ? -1 : 1));
    setLoading(true);

    try {
      await toggleUpvote(complaint._id, userLat, userLng, token);
      onUpvoteChange?.();
    } catch (err) {
      // Revert on error
      setHasUpvoted(wasUpvoted);
      setUpvotes((n) => n + (wasUpvoted ? 1 : -1));
      console.error('Upvote error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="complaint-card card">
      {/* Image */}
      {complaint.image_url && (
        <div className="card-image">
          <img src={complaint.image_url} alt={complaint.title} loading="lazy" />
        </div>
      )}

      {/* Body */}
      <div className="card-body">
        {/* Header row */}
        <div className="card-header-row">
          <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
          {complaint.distance_km != null && (
            <span className="distance-badge">📍 {complaint.distance_km} km</span>
          )}
        </div>

        <h3 className="card-title">{complaint.title}</h3>

        {complaint.location_text && (
          <p className="card-location">📌 {complaint.location_text}</p>
        )}

        <p className="card-description">{complaint.description}</p>

        {/* Footer */}
        <div className="card-footer">
          <span className="card-date">
            {complaint.created_at
              ? new Date(complaint.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
              : ''}
          </span>

          <button
            className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
            onClick={handleUpvote}
            disabled={loading}
            title={isLoggedIn ? (hasUpvoted ? 'Remove upvote' : 'Upvote') : 'Login to upvote'}
          >
            <span className="upvote-icon">{hasUpvoted ? '▲' : '△'}</span>
            <span className="upvote-count">{upvotes}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
