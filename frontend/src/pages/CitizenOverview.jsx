import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, TrendingUp, AlertTriangle, Trophy, ChevronRight, Zap, Target, Image as ImageIcon, ThumbsUp, Plus, Filter, Search, ChevronDown, Clock, BarChart2, User, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const CitizenOverview = () => {
  const [stats, setStats] = useState({ activeReports: 0, totalUpvotes: 0, tokens: 0 });
  const [nearby, setNearby] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState({ lat: 19.076, lng: 72.877 });
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const fetchLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, complaintsRes, leaderRes] = await Promise.all([
        api.get('/profile'),
        api.get(`/complaints?lat=${userLoc.lat}&lng=${userLoc.lng}`),
        api.get('/leaderboard')
      ]);
      
      setStats({
        activeReports: profileRes.data?.my_complaints?.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length || 0,
        totalUpvotes: profileRes.data?.my_complaints?.reduce((acc, c) => acc + (c.upvotes || 0), 0) || 0,
        tokens: profileRes.data?.tokens || 0
      });
      
      setNearby(complaintsRes.data?.data?.slice(0, 3) || []);
      setLeaders(Array.isArray(leaderRes.data) ? leaderRes.data.slice(0, 5) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userLoc]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="citizen-overview" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Banner */}
      <div className="glass" style={heroBannerStyle}>
          <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={badgeStyle}><Zap size={14} /> AI-POWERED CIVIC HUB</div>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' }}>Community Pulse</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '500px' }}>Your verified reports directly trigger AI-assisted resolution workflows.</p>
          </div>
          <div style={tokenSummaryStyle}>
             <div style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>Your Balance</div>
             <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.tokens}</div>
             <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', opacity: 0.8 }}>CONTRIBUTION TOKENS</div>
          </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
        <StatCard 
          icon={<Target color="var(--primary)" size={24} />} 
          title="Active Reports" 
          value={stats.activeReports} 
          subtitle="Issues currently being addressed"
        />
        <StatCard 
          icon={<TrendingUp color="var(--secondary)" size={24} />} 
          title="Priority Signals" 
          value={stats.totalUpvotes} 
          subtitle="Total community upvotes received"
        />
        <StatCard 
          icon={<ShieldCheck color="var(--success)" size={24} />} 
          title="Trust Score" 
          value="98%" 
          subtitle="Based on report accuracy"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '4rem' }}>
        {/* Left: Nearby Highlights */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Nearby Live Feed</h3>
            <Link to="/dashboard" style={{ color: 'var(--primary)', fontSize: '0.95rem', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              View Full Feed <ChevronRight size={18} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading ? <div>Loading feed...</div> : nearby.map(item => (
              <div key={item._id}>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="glass" 
                  style={{...nearbyCardStyle, border: expandedId === item._id ? '1px solid var(--primary)' : '1px solid transparent'}}
                  onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                >
                  <div style={nearbyImageStyle}>
                    {item.image_url ? (
                       <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <div style={{ opacity: 0.1 }}><ImageIcon size={20} /></div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <StatusBadge status={item.status} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4 }}>{(item.category || 'OTHER').toUpperCase()}</span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{item.title}</h4>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 800 }}>
                          <ThumbsUp size={14} fill="currentColor" /> {item.upvotes || 0}
                       </div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{(item.distance_km || 0).toFixed(1)}km away</div>
                    </div>
                    <motion.div animate={{ rotate: expandedId === item._id ? 180 : 0 }}>
                       <ChevronDown size={20} opacity={0.5} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Expanded Details */}
                {expandedId === item._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="glass" style={expandedContentStyle}>
                       <div style={{ marginBottom: '2rem' }}>
                          <h5 style={expandedTitleStyle}>Description</h5>
                          <p style={{ opacity: 0.8, lineHeight: '1.6', fontSize: '0.95rem' }}>{item.description}</p>
                       </div>

                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                          <div>
                             <h5 style={expandedTitleStyle}>Resolution Timeline</h5>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative' }}>
                                {(item.logs || []).map((log, i) => (
                                  <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }} />
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize' }}>{log.status.replace('_', ' ')}</div>
                                      <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(log.time).toLocaleString()}</div>
                                      {log.remark && <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: 'var(--primary)' }}>{log.remark}</div>}
                                    </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                             {item.status === 'resolved' ? (
                               <div style={resolvedBadgeStyle}>
                                  <CheckCircle2 size={24} />
                                  <div>
                                     <div style={{ fontWeight: 900 }}>RESOLVED</div>
                                     <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>This issue has been closed.</div>
                                  </div>
                               </div>
                             ) : (
                               <button onClick={() => navigate(`/complaint/${item._id}`)} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                                  View Full Details <ChevronRight size={14} />
                               </button>
                             )}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard Mini */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Top Citizens</h3>
            <Link to="/dashboard/leaderboard" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>All</Link>
          </div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {loading ? <div>Fetching leaders...</div> : (leaders || []).map((leader, i) => (
                <div key={leader.user_id || i} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div style={leaderRankStyle(i)}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{leader.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level {Math.floor((leader.tokens || 0) / 100) + 1} Citizen</div>
                  </div>
                  <div style={{ fontWeight: 900, color: 'var(--primary)' }}>{(leader.tokens || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/dashboard/leaderboard')} className="btn btn-outline" style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center' }}>
               Full Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle }) => (
  <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '2rem', borderRadius: '32px' }}>
    <div style={{ marginBottom: '1.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.2rem', letterSpacing: '-1px' }}>{value}</div>
    <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</div>
  </motion.div>
);

// Styles
const heroBannerStyle = {
  padding: '4rem', borderRadius: '48px', marginBottom: '4rem', position: 'relative', overflow: 'hidden',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(236, 72, 153, 0.15))'
};

const badgeStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', 
  borderRadius: '10px', background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', 
  fontWeight: 900, marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)'
};

const tokenSummaryStyle = {
  textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '2rem', 
  borderRadius: '32px', border: '1px solid var(--border-glass)', minWidth: '220px'
};

const nearbyCardStyle = {
  padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '1.5rem', 
  alignItems: 'center', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent'
};

const nearbyImageStyle = {
  width: '70px', height: '70px', borderRadius: '16px', overflow: 'hidden', 
  background: '#111', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const expandedContentStyle = {
  marginTop: '0.5rem', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-glass)',
  background: 'rgba(255,255,255,0.02)', marginBottom: '1rem'
};

const expandedTitleStyle = {
  fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', 
  letterSpacing: '1px', marginBottom: '1rem'
};

const resolvedBadgeStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
  borderRadius: '16px', color: 'var(--success)', textAlign: 'left'
};

const leaderRankStyle = (i) => ({
  width: '32px', height: '32px', borderRadius: '50%', 
  background: i === 0 ? 'var(--warning)' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.05)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', 
  fontSize: '0.8rem', fontWeight: 900, color: i < 3 ? '#000' : '#fff'
});

export default CitizenOverview;
