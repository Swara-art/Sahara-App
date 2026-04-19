import { useState } from 'react';
import { postComplaint } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './PostComplaintModal.css';

export default function PostComplaintModal({ onClose, onSuccess, userLat, userLng }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', location_text: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim())       return setError('Title is required.');
    if (!form.description.trim()) return setError('Description is required.');
    if (!userLat || !userLng)     return setError('Location not available. Allow location access and try again.');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',         form.title.trim());
      fd.append('description',   form.description.trim());
      fd.append('lat',           userLat);
      fd.append('lng',           userLng);
      fd.append('location_text', form.location_text.trim());
      if (image) fd.append('image', image);

      await postComplaint(fd, token);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post complaint.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>📝 Post a Complaint</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-title">Title *</label>
            <input
              id="complaint-title"
              name="title"
              className="form-input"
              placeholder="Brief title of the issue"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="complaint-desc">Description *</label>
            <textarea
              id="complaint-desc"
              name="description"
              className="form-input"
              placeholder="Describe the issue in detail…"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="complaint-location">Landmark / Location (optional)</label>
            <input
              id="complaint-location"
              name="location_text"
              className="form-input"
              placeholder="e.g. Near City Hall, MG Road"
              value={form.location_text}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="complaint-image">Photo (optional)</label>
            <input
              id="complaint-image"
              type="file"
              accept="image/*"
              className="form-input file-input"
              onChange={(e) => setImage(e.target.files[0] || null)}
            />
          </div>

          <div className="location-hint">
            {userLat
              ? `📍 Using your current location (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`
              : '⚠️ Location not found — allow location access for accurate filing.'}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
