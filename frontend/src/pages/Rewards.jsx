import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, ShoppingBag, Send, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import api from '../api/axios';

const Rewards = () => {
  const [vouchers, setVouchers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/vouchers'),
        api.get('/profile')
      ]);
      setVouchers(Array.isArray(vRes.data) ? vRes.data : []);
      setProfile(pRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load rewards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (id) => {
    try {
      await api.post(`/vouchers/buy/${id}`);
      fetchData();
      setBuyingId(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Transaction failed. Check your balance.');
      setBuyingId(null);
    }
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading Reward Hub...</div>;
  if (error || !profile) return (
    <div style={{ padding: '5rem', textAlign: 'center' }}>
      <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Reward hub unreachable'}</div>
      <button onClick={fetchData} className="btn btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="rewards-page">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left Side: Shop */}
        <div>
          <div className="glass" style={{ marginBottom: '3rem', borderRadius: '32px', overflow: 'hidden', minHeight: '200px', background: 'linear-gradient(45deg, #111, #222)' }}>
            <div style={{ padding: '3rem 2rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Reward Hub</h2>
                <p style={{ color: 'var(--text-muted)' }}>Exchange your hard-earned tokens for premium vouchers.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {vouchers.map(v => (
              <ShopCard 
                key={v._id} 
                voucher={v} 
                canAfford={profile.tokens >= v.cost}
                isConfirming={buyingId === v._id}
                onBuyClick={() => setBuyingId(v._id)}
                onCancel={() => setBuyingId(null)}
                onConfirm={() => handleBuy(v._id)}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Wallet & My Rewards */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          {/* Wallet Card */}
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1))', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.8rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)' }}>
                <Zap size={24} color="var(--warning)" />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Balance</span>
            </div>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{profile.tokens.toLocaleString()}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SAHARA TOKENS</div>
          </div>

          {/* Owned Vouchers */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Ticket size={20} color="var(--primary)" /> My Vouchers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profile.rewards && profile.rewards.length > 0 ? (
                profile.rewards.map((owned, i) => (
                  <div key={i} className="glass" style={{ padding: '1.2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.3rem' }}>VOUCHER CODE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>{owned.code || 'X7G2-9K2L-P901'}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{owned.voucher_id.replace(/_/g, ' ')}</div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                   You haven't purchased any vouchers yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopCard = ({ voucher, canAfford, isConfirming, onBuyClick, onCancel, onConfirm }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass glow-card" 
    style={{ borderRadius: '28px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
  >
    <div style={{ height: '160px', background: '#000', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {voucher.image_url ? (
          <img src={voucher.image_url} alt={voucher.name} style={{ maxHeight: '100%', maxWidth: '80%', objectFit: 'contain' }} />
      ) : <ShoppingBag size={48} opacity={0.2} />}
    </div>

    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{voucher.name}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', flex: 1 }}>{voucher.description}</p>
      
      {!isConfirming ? (
        <button 
          onClick={onBuyClick}
          disabled={!canAfford}
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', background: canAfford ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.05)', color: canAfford ? 'white' : 'rgba(255,255,255,0.2)' }}
        >
          {canAfford ? `Buy for ${voucher.cost} Tokens` : 'Insufficient Funds'}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', gap: '0.8rem' }}>
          <button onClick={onConfirm} className="btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--success)', color: 'white' }}>Confirm</button>
          <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default Rewards;
