import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Clock, MapPin } from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem' }}>Loading profile...</div>;

  return (
    <div className="profile-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass" 
        style={{ padding: '3rem', borderRadius: '32px', display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '3rem' }}
      >
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800 }}>
          {profile.name ? profile.name.charAt(0) : 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{profile.name || 'User'}</h2>
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> {profile.email || 'user@example.com'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={16} color="var(--warning)" /> {profile.tokens} Tokens</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard icon={<Clock />} label="Reports Filed" value={profile.my_complaints?.length || 0} />
        <StatCard icon={<Award color="var(--success)" />} label="Vouchers Earned" value={profile.rewards?.length || 0} />
        <StatCard icon={<User color="var(--accent-blue)" />} label="Impact Score" value="Top 5%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* My Complaints Box */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Reports</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {profile.my_complaints && profile.my_complaints.length > 0 ? (
              profile.my_complaints.map(comp => (
                <div key={comp._id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: getStatusColor(comp.status) }}>{comp.status.toUpperCase()}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(comp.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{comp.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} /> {comp.location_text || 'Nearby'}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
                No reports yet.
              </div>
            )}
          </div>
        </div>

        {/* My Rewards Box */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Rewards</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {profile.rewards && profile.rewards.length > 0 ? (
              profile.rewards.map((reward, i) => (
                <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), transparent)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>VOUCHER CODE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px' }}>{reward.code}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>ID: {reward.voucher_id}</div>
                </div>
              ))
            ) : (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
                No rewards yet. Visit the rewards shop!
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', textAlign: 'center' }}>
    <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
  </div>
);

const getStatusColor = (status) => {
  switch(status) {
    case 'pending': return 'var(--warning)';
    case 'approved': return 'var(--accent-blue)';
    case 'assigned': return '#7c3aed';
    case 'in_progress': return '#ec4899';
    case 'resolved': return 'var(--success)';
    default: return 'var(--text-muted)';
  }
};

export default Profile;
