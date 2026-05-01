import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Send, X, Loader2 } from 'lucide-react';
import api from '../api/axios';

const ComplaintForm = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    lat: null, 
    lng: null 
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    captureLocation();
  }, []);

  const captureLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          setLocating(false);
        },
        (err) => {
          setError('Location access denied. This is mandatory for reporting.');
          setLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation not supported by your browser.');
      setLocating(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.lat || !formData.lng) {
      setError('Photo and Location are mandatory.');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);
      data.append('image', file);

      await api.post('/complaint', data);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={overlayStyle}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass" 
        style={modalStyle}
      >
        <div style={headerStyle}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Report Issue</h3>
          <button onClick={onClose} style={closeButtonStyle}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Issue Title *</label>
            <input 
              type="text" placeholder="e.g. Broken Street Light" required 
              style={inputStyle} value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Description (Optional)</label>
            <textarea 
              placeholder="Provide more details if necessary..." 
              style={{ ...inputStyle, minHeight: '100px', resize: 'none' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Live Photo *</label>
              <label style={cameraLabelStyle}>
                {preview ? (
                  <img src={preview} alt="Preview" style={previewStyle} />
                ) : (
                  <div style={cameraPlaceholderStyle}>
                    <Camera size={32} />
                    <span>Capture Photo</span>
                  </div>
                )}
                <input 
                  type="file" accept="image/*" capture="camera" 
                  hidden required onChange={handleFileChange} 
                />
              </label>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Current Location *</label>
              <div style={locationBoxStyle}>
                {locating ? (
                  <div style={locatingStyle}>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Capturing GPS...</span>
                  </div>
                ) : formData.lat ? (
                  <div style={locationInfoStyle}>
                    <MapPin size={20} color="var(--success)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Coordinates Verified</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</div>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={captureLocation} style={retryLocationStyle}>
                    Retry Location Access
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={errorStyle}>
              {error}
            </motion.div>
          )}

          <div style={footerStyle}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button 
              type="submit" 
              disabled={submitting || locating || !formData.lat} 
              className="btn btn-primary" 
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {submitting ? 'Submitting...' : 'Send Report'} <Send size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
  backdropFilter: 'blur(12px)', zIndex: 1000, 
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
};

const modalStyle = {
  width: '100%', maxWidth: '650px', borderRadius: '32px', 
  padding: '2.5rem', background: 'rgba(20, 20, 20, 0.6)',
  border: '1px solid var(--border-glass)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'
};

const closeButtonStyle = {
  background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', 
  width: '40px', height: '40px', borderRadius: '50%', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};

const formStyle = {
  display: 'flex', flexDirection: 'column', gap: '1.5rem'
};

const inputGroupStyle = {
  display: 'flex', flexDirection: 'column', gap: '0.6rem'
};

const labelStyle = {
  fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%', padding: '1.2rem', background: 'rgba(255, 255, 255, 0.03)', 
  border: '1px solid var(--border-glass)', borderRadius: '16px', 
  color: 'white', outline: 'none', transition: '0.2s', fontSize: '1rem'
};

const cameraLabelStyle = {
  height: '160px', background: 'rgba(255, 255, 255, 0.03)', 
  border: '2px dashed var(--border-glass)', borderRadius: '16px', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden'
};

const cameraPlaceholderStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)'
};

const previewStyle = {
  width: '100%', height: '100%', objectFit: 'cover'
};

const locationBoxStyle = {
  height: '160px', background: 'rgba(255, 255, 255, 0.03)', 
  border: '1px solid var(--border-glass)', borderRadius: '16px', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
};

const locatingStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)'
};

const locationInfoStyle = {
  display: 'flex', gap: '1rem', alignItems: 'center', textAlign: 'left'
};

const retryLocationStyle = {
  background: 'rgba(255,48,64,0.1)', border: '1px solid #ff3040', color: '#ff3040',
  padding: '0.8rem 1.2rem', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer'
};

const errorStyle = {
  padding: '1rem', background: 'rgba(255,48,64,0.1)', border: '1px solid #ff3040', 
  borderRadius: '12px', color: '#ff3040', fontSize: '0.9rem', textAlign: 'center'
};

const footerStyle = {
  display: 'flex', gap: '1.5rem', marginTop: '1.5rem'
};

export default ComplaintForm;
