import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../hooks/useUserLocation';
import { useToast } from '../hooks/useToast';
import { searchNearby } from '../api/api';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import PostComplaintModal from '../components/PostComplaintModal';
import Toast from '../components/Toast';
import './HomePage.css';

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const { lat, lng, loading: locLoading, error: locError } = useUserLocation();
  const { toast, showToast } = useToast();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [query, setQuery]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showModal, setShowModal]   = useState(false);

  // Fetch complaints whenever location or query changes
  const fetchComplaints = useCallback(async () => {
    if (!lat || !lng) return;
    setLoading(true);
    try {
      const data = await searchNearby(lat, lng, query);
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to load complaints: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, query, showToast]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  function handleSearch(q) { setQuery(q); }

  function handlePostClick() {
    if (!isLoggedIn) { navigate('/login'); return; }
    setShowModal(true);
  }

  // Status counts for stat bar
  const counts = complaints.reduce(
    (acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; },
    {}
  );

  return (
    <div className="home-page">
      <Navbar onSearch={handleSearch} showSearch />

      {/* Hero / stats strip */}
      <section className="hero-strip">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>Nearby Civic Complaints</h1>
            <p>Issues reported within 5 km of your location</p>
          </div>
          <div className="hero-stats">
            <StatPill icon="🕐" label="Pending"     value={counts.pending     || 0} />
            <StatPill icon="⚙️" label="In Progress" value={counts.in_progress || 0} />
            <StatPill icon="✅" label="Resolved"    value={counts.resolved    || 0} />
          </div>
          <button className="btn btn-primary post-btn" onClick={handlePostClick}>
            + Post Complaint
          </button>
        </div>
      </section>

      {/* Location error */}
      {locError && (
        <div className="container">
          <div className="location-error-bar">⚠️ {locError}</div>
        </div>
      )}

      {/* Feed */}
      <main className="container feed-container">
        {locLoading && (
          <div className="center-state">
            <span className="spinner" style={{ width: 32, height: 32 }} />
            <p>Getting your location…</p>
          </div>
        )}

        {!locLoading && loading && (
          <div className="complaints-grid skeleton-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!locLoading && !loading && complaints.length === 0 && lat && (
          <div className="center-state">
            <span style={{ fontSize: '3rem' }}>📭</span>
            <p>No complaints found nearby{query ? ` for "${query}"` : ''}.</p>
          </div>
        )}

        {!locLoading && !loading && complaints.length > 0 && (
          <div className="complaints-grid">
            {complaints.map((c) => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                userLat={lat}
                userLng={lng}
                onUpvoteChange={fetchComplaints}
              />
            ))}
          </div>
        )}
      </main>

      {/* Post Complaint Modal */}
      {showModal && (
        <PostComplaintModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { showToast('Complaint posted!', 'success'); fetchComplaints(); }}
          userLat={lat}
          userLng={lng}
        />
      )}

      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ height: 18, width: '80%' }} />
        <div className="skeleton" style={{ height: 12, width: '90%' }} />
        <div className="skeleton" style={{ height: 12, width: '65%' }} />
      </div>
    </div>
  );
}
