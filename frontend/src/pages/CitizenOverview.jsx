import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const CitizenOverview = () => {
  const [stats, setStats] = useState({ activeReports: 0, totalUpvotes: 0 });
  const [nearby, setNearby] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, complaintsRes, leaderRes] = await Promise.all([
        api.get('/profile'),
        api.get('/complaints?lat=19.076&lng=72.877'),
        api.get('/leaderboard')
      ]);
      
      setStats({
        activeReports: profileRes.data?.my_complaints?.filter(c => c.status !== 'resolved').length || 0,
        totalUpvotes: profileRes.data?.my_complaints?.reduce((acc, c) => acc + (c.upvotes || 0), 0) || 0
      });
      
      setNearby(complaintsRes.data?.data?.slice(0, 3) || []);
      setLeaders(Array.isArray(leaderRes.data) ? leaderRes.data.slice(0, 3) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-overview">
      <div className="glass" style={{ marginBottom: '3rem', borderRadius: '40px', overflow: 'hidden', height: '200px', position: 'relative', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1))' }}>
          <div style={{ position: 'absolute', bottom: '2rem', left: '3rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Community Pulse</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Your action makes a difference.</p>
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <SummaryCard 
          icon={<AlertTriangle color="var(--secondary)" size={32} />} 
          title="Active Reports" 
          value={stats.activeReports} 
          subtitle="Issues in progress"
        />
        <SummaryCard 
          icon={<TrendingUp color="var(--success)" size={32} />} 
          title="Community Impact" 
          value={stats.totalUpvotes} 
          subtitle="Total upvotes received"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
        {/* Left: Nearby Highlights */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Live Feed (Nearby)</h3>
            <Link to="/dashboard/full-map" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>Explore Map</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {loading ? <div>Loading feed...</div> : nearby.map(item => (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                key={item._id} 
                className="glass" 
                style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', gap: '1.5rem', alignItems: 'center' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '14px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                  {item.image_url ? (
                     <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #222, #111)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{item.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {item.location_text || 'Nearby'}</span>
                    <span>{item.distance_km}km away</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{item.upvotes}</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Upvotes</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Real Leaderboard */}
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', height: 'fit-content', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Trophy size={20} color="var(--warning)" /> Top Contributors
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading ? <div>Fetching leaders...</div> : leaders.map((leader, i) => (
              <div key={leader._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: i === 0 ? 'var(--warning)' : 'var(--border-glass)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '0.8rem', fontWeight: 800, color: i === 0 ? '#000' : '#fff' 
                }}>
                    {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{leader.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Citizen</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{leader.tokens.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <Link to="/dashboard/leaderboard" className="btn btn-outline" style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center', fontSize: '0.9rem' }}>
            Full Rankings
          </Link>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, title, value, subtitle }) => (
  <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '2.5rem', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, transform: 'scale(1.5)' }}>{icon}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: 500 }}>{title}</div>
    <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.3rem', letterSpacing: '-1px' }}>{value}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</div>
  </motion.div>
);

export default CitizenOverview;
