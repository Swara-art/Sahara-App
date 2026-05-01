import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Shield, Award, 
  History, LogOut, ChevronRight, Wallet,
  Gift, CheckCircle2, Building, Briefcase
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '10rem' }}>Loading Profile...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '10rem' }}>Profile not found.</div>;

  const isCitizen = profile.role === 'citizen';

  const citizenStats = [
    { label: 'Total Tokens', value: profile.tokens || 0, icon: <Wallet size={20} color="var(--primary)" />, color: 'var(--primary)' },
    { label: 'Total Reports', value: profile.my_complaints?.length || 0, icon: <History size={20} color="var(--secondary)" />, color: 'var(--secondary)' },
    { label: 'Resolved', value: profile.my_complaints?.filter(c => c.status === 'resolved').length || 0, icon: <CheckCircle2 size={20} color="var(--success)" />, color: 'var(--success)' },
    { label: 'Vouchers', value: profile.rewards?.length || 0, icon: <Gift size={20} color="var(--warning)" />, color: 'var(--warning)' }
  ];

 return (
  <div
    className="profile-page"
    style={{ maxWidth: '1000px', margin: '0 auto' }}
  >
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isCitizen ? '350px 1fr' : '1fr',
        gap: '3rem'
      }}
    >

      {/* Identity Column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          maxWidth: isCitizen ? 'none' : '600px',
          margin: isCitizen ? '0' : '0 auto'
        }}
      >
        <div
          className="glass"
          style={{
            padding: '4rem 3rem',
            borderRadius: '40px',
            textAlign: 'center'
          }}
        >
          <div style={avatarStyle}>
            <div style={avatarGradientStyle} />
            <User size={48} color="#fff" />
          </div>

          <h3
            style={{
              fontSize: '2.2rem',
              fontWeight: 900,
              marginBottom: '0.5rem'
            }}
          >
            {profile.name || 'User'}
          </h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '2.5rem'
            }}
          >
            <span style={roleBadgeStyle}>
              {profile.role ? profile.role.toUpperCase() : 'N/A'}
            </span>

            {!isCitizen && profile.department && (
              <span style={deptBadgeStyle}>
                {profile.department
                  ? profile.department.toUpperCase()
                  : 'N/A'}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              textAlign: 'left',
              background: 'rgba(255,255,255,0.03)',
              padding: '2rem',
              borderRadius: '24px'
            }}
          >
            <div style={infoRowStyle}>
              <Mail size={18} color="var(--primary)" />
              {profile.email || 'N/A'}
            </div>

            <div style={infoRowStyle}>
              <Phone size={18} color="var(--primary)" />
              {profile.phone || 'N/A'}
            </div>

            <div style={infoRowStyle}>
              <Shield size={18} color="var(--primary)" />
              System ID:{" "}
              {profile.user_id
                ? profile.user_id.slice(-8).toUpperCase()
                : 'N/A'}
            </div>

            {!isCitizen && (
              <div style={infoRowStyle}>
                <Building size={18} color="var(--primary)" />
                Jurisdiction: Regional Hub
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{
              width: '100%',
              marginTop: '3rem',
              color: '#ff3040',
              borderColor: 'rgba(255,48,64,0.2)',
              padding: '1rem'
            }}
          >
            <LogOut size={20} /> Logout Account
          </button>
        </div>

        {isCitizen && (
          <div
            className="glass"
            style={{
              padding: '2rem',
              borderRadius: '32px'
            }}
          >
            <h4 style={sectionTitleStyle}>Tokens & Rewards</h4>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem'
              }}
            >
              {citizenStats.map((s, i) => (
                <div key={i} style={statItemStyle}>
                  <div
                    style={{
                      ...statIconStyle,
                      background: `${s.color}15`
                    }}
                  >
                    {s.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {s.label}
                    </div>

                    <div
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 900
                      }}
                    >
                      {s.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/dashboard/rewards')}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '2rem',
                justifyContent: 'center'
              }}
            >
              Redeem Tokens
            </button>
          </div>
        )}
      </div>

      {/* Right Column */}
      {isCitizen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3rem'
          }}
        >

          {/* Purchased Rewards */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800
                }}
              >
                Purchased Rewards
              </h3>
            </div>

            {profile.rewards && profile.rewards.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {profile.rewards.map((v, i) => (
                  <motion.div
                    whileHover={{ y: -5 }}
                    key={i}
                    className="glass"
                    style={voucherCardStyle}
                  >
                    <Gift
                      size={24}
                      color="var(--primary)"
                      style={{ marginBottom: '1rem' }}
                    />

                    <h4
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        marginBottom: '0.4rem'
                      }}
                    >
                      {v.name}
                    </h4>

                    <div style={voucherTagStyle}>Redeemed</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div
                className="glass"
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  borderRadius: '24px',
                  opacity: 0.6
                }}
              >
                <p>No rewards purchased yet.</p>
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800
                }}
              >
                Recent Reports
              </h3>

              <button
                onClick={() => navigate('/dashboard/activity')}
                className="btn btn-outline"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem'
                }}
              >
                View All
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {profile.my_complaints?.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="glass"
                  style={miniReportStyle}
                  onClick={() => navigate(`/complaint/${c._id}`)}
                >
                  <div style={miniReportDotStyle} />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700
                      }}
                    >
                      {c.title}
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString()
                        : 'No Date'}
                    </div>
                  </div>

                  <StatusBadge status={c.status} />
                  <ChevronRight
                    size={18}
                    style={{ opacity: 0.2 }}
                  />
                </div>
              ))}

              {(!profile.my_complaints ||
                profile.my_complaints.length === 0) && (
                <div
                  className="glass"
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    borderRadius: '24px',
                    opacity: 0.6
                  }}
                >
                  <p>No activity yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

// Styles
const avatarStyle = {
  width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 2rem',
  background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
  position: 'relative', border: '4px solid rgba(255,255,255,0.05)'
};

const avatarGradientStyle = {
  position: 'absolute', inset: -8, borderRadius: '50%', 
  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
  zIndex: -1, opacity: 0.5, filter: 'blur(10px)'
};

const roleBadgeStyle = {
  padding: '0.4rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
  fontSize: '0.75rem', fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)'
};

const deptBadgeStyle = {
  padding: '0.4rem 1rem', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', 
  fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', border: '1px solid rgba(124, 58, 237, 0.2)'
};

const infoRowStyle = {
  display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', color: 'rgba(255,255,255,0.8)'
};

const sectionTitleStyle = {
  fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', opacity: 0.7
};

const statItemStyle = {
  display: 'flex', alignItems: 'center', gap: '1rem'
};

const statIconStyle = {
  width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const voucherCardStyle = {
  padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-glass)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)'
};

const voucherTagStyle = {
  fontSize: '0.65rem', fontWeight: 900, color: 'var(--success)', 
  background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', width: 'fit-content'
};

const miniReportStyle = {
  padding: '1.2rem 1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.5rem',
  cursor: 'pointer', transition: '0.2s', border: '1px solid transparent'
};

const miniReportDotStyle = {
  width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)'
};

export default Profile ; 
