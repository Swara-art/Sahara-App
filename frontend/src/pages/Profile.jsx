import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Clock, MapPin, Shield, Zap, Inbox } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, adminCountRes, mediatorCountRes] = await Promise.all([
        api.get('/profile'),
        user?.role === 'admin' ? api.get('/admin/pending') : Promise.resolve({ data: [] }),
        user?.role === 'mediator' ? api.get('/mediator/approved') : Promise.resolve({ data: [] })
      ]);
      
      setProfile(profileRes.data);
      if (user?.role === 'admin') {
        setPendingCount(adminCountRes.data.length);
      } else if (user?.role === 'mediator') {
        setPendingCount(mediatorCountRes.data.length);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing Profile...</div>;
  
  if (error || !profile) return (
    <div style={{ padding: '5rem', textAlign: 'center' }}>
      <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Profile not found'}</div>
      <button onClick={fetchProfile} className="btn btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="profile-page" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass" 
        style={{ 
            padding: '4rem', borderRadius: '40px', display: 'flex', gap: '4rem', 
            alignItems: 'center', marginBottom: '3rem', 
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div style={{ position: 'relative' }}>
            <div style={{ 
                width: '160px', height: '160px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '4rem', fontWeight: 900, color: 'white',
                boxShadow: '0 20px 40px rgba(124, 58, 237, 0.3)'
            }}>
            {profile.name ? profile.name.charAt(0) : 'U'}
            </div>
            <div style={{ 
                position: 'absolute', bottom: '5px', right: '5px', 
                background: 'var(--success)', padding: '0.5rem', borderRadius: '50%',
                border: '4px solid #000'
            }}>
                <Shield size={16} color="white" />
            </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900 }}>{profile.name || 'User'}</h2>
            <span style={{ padding: '0.4rem 1rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>
              {user?.role.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            {(user?.role !== 'admin' && user?.role !== 'mediator') && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Mail size={18} /> {profile.email || 'user@example.com'}</span>
            )}
            {(user?.role !== 'admin' && user?.role !== 'mediator') && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Zap size={18} color="var(--warning)" /> {profile.tokens.toLocaleString()} Tokens</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: (user?.role === 'admin' || user?.role === 'mediator') ? '1fr' : 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
        {user?.role === 'admin' || user?.role === 'mediator' ? (
          <ProfileStatCard icon={<Inbox size={24} />} label={user?.role === 'admin' ? "Pending Actions" : "Pending Assignments"} value={pendingCount} color="var(--warning)" />
        ) : (
          <>
            <ProfileStatCard icon={<Clock size={24} />} label="Total Reports" value={profile.my_complaints?.length || 0} color="var(--primary)" />
            <ProfileStatCard icon={<Award size={24} />} label="Vouchers Owned" value={profile.rewards?.length || 0} color="var(--secondary)" />
            <ProfileStatCard icon={<Zap size={24} />} label="Global Rank" value="#42" color="var(--warning)" />
          </>
        )}
      </div>

      {(user?.role !== 'admin' && user?.role !== 'mediator') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Recent Contributions */}
          <div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Clock size={20} color="var(--primary)" /> Recent Reports
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {(profile.my_complaints || []).slice(0, 3).map(comp => (
                <div key={comp._id} className="glass" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: getStatusColor(comp.status) }}>{comp.status.toUpperCase()}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(comp.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>{comp.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} /> {comp.location_text || 'Nearby'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Owned Rewards */}
          <div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Award size={20} color="var(--secondary)" /> My Rewards
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {profile.rewards && profile.rewards.length > 0 ? (
                profile.rewards.map((reward, i) => (
                  <div key={i} className="glass" style={{ 
                      padding: '1.5rem', borderRadius: '24px', 
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), transparent)',
                      borderLeft: '4px solid var(--secondary)'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '1px' }}>VOUCHER UNLOCKED</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '2px', fontFamily: 'monospace' }}>{reward.code}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>ID: {reward.voucher_id.toUpperCase()}</div>
                  </div>
                ))
              ) : (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '32px' }}>
                  No collectibles yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileStatCard = ({ icon, label, value, color }) => (
  <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', textAlign: 'center', borderBottom: `4px solid ${color}` }}>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{value}</div>
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
