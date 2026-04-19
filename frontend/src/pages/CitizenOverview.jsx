import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const CitizenOverview = () => {
  const [stats, setStats] = useState({ tokens: 0, activeReports: 0, totalUpvotes: 0 });
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, complaintsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/complaints?lat=19.076&lng=72.877')
      ]);
      
      setStats({
        tokens: profileRes.data.tokens,
        activeReports: profileRes.data.my_complaints?.filter(c => c.status !== 'resolved').length || 0,
        totalUpvotes: profileRes.data.my_complaints?.reduce((acc, c) => acc + (c.upvotes || 0), 0) || 0
      });
      
      setNearby(complaintsRes.data.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-overview">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <SummaryCard 
          icon={<Award color="var(--warning)" size={32} />} 
          title="Total Tokens" 
          value={stats.tokens} 
          subtitle="Redeemable for vouchers"
        />
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left: Nearby Highlights */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Help Needed Nearby</h3>
            <Link to="/dashboard/full-map" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none' }}>View full map</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {nearby.map(item => (
              <div key={item._id} className="glass" style={{ padding: '1.2rem', borderRadius: '16px', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                  {item.image_url && <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{item.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {item.location_text}</span>
                    <span>{item.distance_km}km away</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.upvotes}</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upvotes</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard or Quick Actions */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--primary)" /> Top Contributors
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <LeaderboardItem rank={1} name="Apoorv K." tokens={1250} />
            <LeaderboardItem rank={2} name="Sarah M." tokens={980} />
            <LeaderboardItem rank={3} name="John D." tokens={840} />
          </div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center', fontSize: '0.9rem' }}>
            View Full Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, title, value, subtitle }) => (
  <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>{icon}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</div>
    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>{value}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{subtitle}</div>
  </motion.div>
);

const LeaderboardItem = ({ rank, name, tokens }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: rank === 1 ? 'var(--warning)' : 'var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: rank === 1 ? '#000' : 'white' }}>{rank}</span>
    <span style={{ flex: 1, fontSize: '0.9rem' }}>{name}</span>
    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tokens}</span>
  </div>
);

export default CitizenOverview;
