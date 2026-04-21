import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, MapPin, Award, ArrowRight, ThumbsUp, X, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';

const Home = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNearby();
  }, []);

  const fetchNearby = async () => {
    try {
      // Default coordinates if geolocation fails
      let lat = 19.076, lng = 72.877;
      
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          const res = await api.get(`/complaints/search-nearby?lat=${lat}&lng=${lng}`);
          setComplaints(res.data || []);
          setLoading(false);
        }, async () => {
          const res = await api.get(`/complaints/search-nearby?lat=${lat}&lng=${lng}`);
          setComplaints(res.data || []);
          setLoading(false);
        });
      } else {
        const res = await api.get(`/complaints/search-nearby?lat=${lat}&lng=${lng}`);
        setComplaints(res.data || []);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setComplaints([]);
      setLoading(false);
    }
  };

  const handleInteraction = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="landing-page" style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <nav className="glass container" style={{ 
        position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
        width: '90%', padding: '1rem 2rem', borderRadius: '20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', zIndex: 100
      }}>
        <div className="brand-font" style={{ fontSize: '1.5rem', background: 'linear-gradient(to right, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SAHARA
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/signup" className="btn btn-primary">Join Now</Link>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ fontSize: '5rem', lineHeight: '1.1', marginBottom: '2rem' }}>
            Empowering Communities <br /> 
            <span style={{ background: 'linear-gradient(to right, #3b82f6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Through Collaboration</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
            Report issues, earn rewards, and work with local authorities to build a better neighborhood. Transparent, fast, and rewarding.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '5rem' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Get Started <ArrowRight size={20} />
            </Link>
            <a href="#live-feed" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              View Live Feed
            </a>
          </div>
        </motion.div>

        {/* Live Feed Section */}
        <section id="live-feed" style={{ marginTop: '5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Nearby Issues</h2>
            <p style={{ color: 'var(--text-muted)' }}>Real-time updates from your community</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>Loading nearby issues...</div>
            ) : complaints.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>No issues reported nearby.</div>
            ) : (
              complaints.map(complaint => (
                <GuestComplaintCard key={complaint._id} complaint={complaint} onInteract={handleInteraction} />
              ))
            )}
          </div>
        </section>

        <section style={{ marginTop: '10rem', paddingBottom: '10rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <FeatureCard 
            icon={<Shield className="primary" />} 
            title="Secure Reporting" 
            desc="Encrypted reports directly to verified authorities and mediators."
          />
          <FeatureCard 
            icon={<MapPin style={{ color: '#ec4899' }} />} 
            title="Location Aware" 
            desc="Interactive maps help you find and support nearby community issues."
          />
          <FeatureCard 
            icon={<Award style={{ color: '#3b82f6' }} />} 
            title="Token Rewards" 
            desc="Earn tokens for every contribution. Redeem them for exclusive vouchers."
          />
        </section>
      </main>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} onAction={() => navigate('/login')} />
        )}
      </AnimatePresence>

      <div style={{ 
        position: 'fixed', top: '-10%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        zIndex: -1 
      }} />
      <div style={{ 
        position: 'fixed', bottom: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
        zIndex: -1 
      }} />
    </div>
  );
};

const GuestComplaintCard = ({ complaint, onInteract }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass" 
    style={{ borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
  >
    <div style={{ height: '200px', background: '#111', position: 'relative' }}>
      {complaint.image_url ? (
        <img src={complaint.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
          <ImageIcon size={40} />
        </div>
      )}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.4rem 0.8rem', borderRadius: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <MapPin size={12} /> {complaint.distance_km}km
      </div>
    </div>
    
    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{complaint.title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
        {complaint.description.length > 100 ? complaint.description.substring(0, 100) + '...' : complaint.description}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onInteract} className="btn-icon" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ThumbsUp size={20} /> <span style={{ fontSize: '0.9rem' }}>{complaint.upvotes} Upvotes</span>
        </button>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{complaint.status}</span>
      </div>
    </div>
  </motion.div>
);

const AuthModal = ({ onClose, onAction }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="glass" 
      style={{ padding: '3rem', borderRadius: '32px', textAlign: 'center', maxWidth: '400px' }}
    >
      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
      </div>
      <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Join the Community</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>You need an account to upvote and report issues. Join us to help build a better neighborhood!</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={onAction} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login / Sign Up</button>
        <button onClick={onClose} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Maybe Later</button>
      </div>
    </motion.div>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass" 
    style={{ padding: '3rem', borderRadius: '24px', textAlign: 'left' }}
  >
    <div style={{ marginBottom: '1.5rem', transform: 'scale(1.5)', display: 'inline-block' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </motion.div>
);

export default Home;

