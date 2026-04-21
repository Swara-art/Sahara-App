import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, User, Shield } from 'lucide-react';
import api from '../api/axios';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-page">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           style={{ display: 'inline-block', padding: '1rem', borderRadius: '20px', background: 'rgba(124, 58, 237, 0.1)', marginBottom: '1.5rem' }}
        >
          <Award size={48} color="var(--warning)" />
        </motion.div>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Community Leaderboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Celebrating the citizens who make out neighborhood a better place to live.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Gathering contributors...</div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass" style={{ borderRadius: '32px', padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px', padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <span>Rank</span>
              <span>Citizen</span>
              <span style={{ textAlign: 'right' }}>Tokens Earned</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {leaders.map((leader, index) => (
                <LeaderRow key={leader._id} leader={leader} index={index} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <MetricCard icon={<TrendingUp color="var(--success)" />} label="Active Users" value="1.2k+" />
            <MetricCard icon={<Shield color="var(--accent-blue)" />} label="Verified Acts" value="850+" />
            <MetricCard icon={<Award color="var(--primary)" />} label="Vouchers Issued" value="420" />
          </div>
        </div>
      )}
    </div>
  );
};

const LeaderRow = ({ leader, index }) => {
  const isTopThree = index < 3;
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.03)' }}
      style={{ 
        display: 'grid', gridTemplateColumns: '80px 1fr 150px', padding: '1.5rem 2rem', 
        borderRadius: '20px', alignItems: 'center' 
      }}
    >
      <span style={{ 
        fontSize: '1.2rem', fontWeight: 800, 
        color: isTopThree ? colors[index] : 'var(--text-muted)' 
      }}>
        #{index + 1}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
            width: '45px', height: '45px', borderRadius: '50%', 
            background: `linear-gradient(135deg, ${isTopThree ? colors[index] : '#333'}, #111)`,
            padding: '2px'
        }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color={isTopThree ? colors[index] : '#666'} />
            </div>
        </div>
        <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{leader.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Citizen</div>
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
        {leader.tokens.toLocaleString()}
      </div>
    </motion.div>
  );
};

const MetricCard = ({ icon, label, value }) => (
    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
        <div style={{ marginBottom: '0.5rem' }}>{icon}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.2rem' }}>{value}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{label}</div>
    </div>
);

export default Leaderboard;
