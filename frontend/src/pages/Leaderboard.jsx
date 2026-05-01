import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, User, Star } from 'lucide-react';
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
      setLeaders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={headerStyle}>
         <div style={iconBadgeStyle}><Trophy size={48} color="var(--warning)" /></div>
         <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>Top Citizens</h2>
         <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Celebrating the most active community members in your area.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem' }}>Calculating Rankings...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Top 3 Podium */}
          <div style={podiumGridStyle}>
             {leaders[1] && <PodiumItem leader={leaders[1]} rank={2} color="#C0C0C0" icon={<Medal size={32} />} />}
             {leaders[0] && <PodiumItem leader={leaders[0]} rank={1} color="var(--warning)" icon={<Crown size={48} />} isTop />}
             {leaders[2] && <PodiumItem leader={leaders[2]} rank={3} color="#CD7F32" icon={<Medal size={32} />} />}
          </div>

          {/* List View for the rest */}
          <div className="glass" style={{ borderRadius: '32px', overflow: 'hidden', padding: '1rem' }}>
             <div style={tableHeaderStyle}>
                <span style={{ width: '80px', textAlign: 'center' }}>Rank</span>
                <span style={{ flex: 1 }}>Citizen</span>
                <span style={{ width: '150px', textAlign: 'right' }}>Total Tokens</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(leaders || []).slice(3).map((leader, i) => (
                   <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.05 }}
                    key={leader.user_id || i} 
                    style={listRowStyle}
                   >
                      <span style={rankBadgeStyle}>{i + 4}</span>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <div style={smallAvatarStyle}><User size={14} /></div>
                         <div style={{ fontWeight: 700 }}>{leader.name || 'Anonymous'}</div>
                      </div>
                      <span style={tokenValueStyle}>{(leader.tokens || 0).toLocaleString()}</span>
                   </motion.div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PodiumItem = ({ leader, rank, color, icon, isTop }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: rank * 0.2 }}
    className="glass"
    style={{ 
        ...podiumCardStyle, 
        padding: isTop ? '3.5rem 2rem' : '2.5rem 2rem',
        marginTop: isTop ? '0' : '2rem',
        border: `2px solid ${color}33`,
        background: `linear-gradient(180deg, ${color}05 0%, transparent 100%)`
    }}
  >
    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
       {icon}
    </div>
    <div style={{ ...podiumAvatarStyle, borderColor: color }}>
       <User size={isTop ? 40 : 28} />
    </div>
    <h4 style={{ fontSize: isTop ? '1.5rem' : '1.2rem', fontWeight: 900, marginBottom: '0.4rem' }}>{leader.name}</h4>
    <div style={{ color: color, fontWeight: 900, fontSize: isTop ? '2rem' : '1.5rem', letterSpacing: '-1px' }}>
       {leader.tokens.toLocaleString()}
    </div>
    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.5rem' }}>Tokens</div>
  </motion.div>
);

// Styles
const headerStyle = {
  textAlign: 'center', marginBottom: '5rem'
};

const iconBadgeStyle = {
  width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
  border: '1px solid rgba(245, 158, 11, 0.2)'
};

const podiumGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'flex-start'
};

const podiumCardStyle = {
  borderRadius: '40px', textAlign: 'center', position: 'relative'
};

const podiumAvatarStyle = {
  width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
  background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '4px solid'
};

const tableHeaderStyle = {
  display: 'flex', padding: '1.5rem 2rem', fontSize: '0.75rem', fontWeight: 900,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px',
  borderBottom: '1px solid var(--border-glass)'
};

const listRowStyle = {
  display: 'flex', alignItems: 'center', padding: '1.2rem 2rem',
  borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.2s'
};

const rankBadgeStyle = {
  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900,
  marginRight: '2.5rem', color: 'var(--text-muted)'
};

const smallAvatarStyle = {
  width: '32px', height: '32px', borderRadius: '50%', background: '#111',
  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)'
};

const tokenValueStyle = {
  width: '150px', textAlign: 'right', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem'
};

export default Leaderboard;
