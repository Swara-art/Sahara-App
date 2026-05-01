import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Gift, ShoppingBag, Wallet, Info, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Rewards = () => {
  const [vouchers, setVouchers] = useState([]);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/vouchers'),
        api.get('/profile')
      ]);
      setVouchers(vRes.data);
      setTokens(pRes.data.tokens);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (id) => {
    setBuyingId(id);
    try {
      await api.post(`/vouchers/buy/${id}`);
      await fetchData();
      alert('Congratulations! Voucher added to your profile.');
    } catch (err) {
      alert(err.response?.data?.error || 'Transaction failed.');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="rewards-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Hero Stats */}
      <div className="glass" style={heroContainerStyle}>
        <div style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Rewards Store</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>Exchange your contribution tokens for exclusive local vouchers.</p>
        </div>
        <div style={tokenBadgeStyle}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>Available Balance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             <Wallet size={32} color="var(--primary)" />
             <span style={{ fontSize: '2.8rem', fontWeight: 900 }}>{tokens.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', padding: '1.2rem', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
         <Info size={20} color="var(--accent-blue)" />
         <p style={{ fontSize: '0.9rem', color: 'var(--accent-blue)' }}>Tokens are earned by reporting valid community issues and receiving upvotes from neighbors.</p>
      </div>

      {/* Vouchers Grid */}
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <ShoppingBag size={24} color="var(--primary)" /> Available Vouchers
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Store...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {vouchers.map((v, i) => (
            <VoucherCard 
              key={v._id} 
              voucher={v} 
              canAfford={tokens >= v.cost} 
              onBuy={() => handleBuy(v._id)}
              loading={buyingId === v._id}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const VoucherCard = ({ voucher, canAfford, onBuy, loading, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="glass" 
    style={voucherCardStyle}
  >
    <div style={voucherTopStyle}>
      <div style={voucherIconStyle}>
        <Gift size={28} color="var(--primary)" />
      </div>
      <div style={voucherCostStyle}>
        {voucher.cost} <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>TOKENS</span>
      </div>
    </div>

    <div style={{ padding: '2rem' }}>
      <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.8rem' }}>{voucher.name}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', minHeight: '3rem' }}>
        {voucher.description}
      </p>

      <button 
        onClick={onBuy} 
        disabled={!canAfford || loading}
        className={canAfford ? "btn btn-primary" : "btn btn-outline"} 
        style={{ width: '100%', justifyContent: 'center', opacity: canAfford ? 1 : 0.4, cursor: canAfford ? 'pointer' : 'not-allowed' }}
      >
        {loading ? 'Processing...' : canAfford ? 'Buy Voucher' : 'Insufficient Tokens'}
        {canAfford && !loading && <ArrowRight size={18} />}
      </button>
    </div>
  </motion.div>
);

// Styles
const heroContainerStyle = {
  padding: '4rem', borderRadius: '48px', marginBottom: '3rem', 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1))',
  position: 'relative', overflow: 'hidden'
};

const tokenBadgeStyle = {
  background: 'rgba(255,255,255,0.03)', padding: '2rem 3rem', borderRadius: '32px',
  border: '1px solid var(--border-glass)', textAlign: 'right', minWidth: '280px'
};

const voucherCardStyle = {
  borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border-glass)',
  display: 'flex', flexDirection: 'column'
};

const voucherTopStyle = {
  height: '140px', background: 'rgba(255,255,255,0.02)', display: 'flex', 
  justifyContent: 'space-between', alignItems: 'flex-start', padding: '2rem'
};

const voucherIconStyle = {
  width: '60px', height: '60px', borderRadius: '20px', 
  background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const voucherCostStyle = {
  fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px'
};

export default Rewards;
