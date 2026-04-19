import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="landing-page">
      <nav className="glass container" style={{ 
        position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
        width: '90%', padding: '1rem 2rem', borderRadius: '20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', zIndex: 100
      }}>
        <div className="brand-font" style={{ fontSize: '1.5rem', background: 'linear-gradient(to right, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SAHARA
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/signup" className="btn btn-primary">Join Now</Link>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ fontSize: '5rem', lineHeight: '1.1', marginBottom: '2rem' }}>
            Empowering Communities <br /> 
            <span style={{ background: 'linear-gradient(to right, #3b82f6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Through Collaboration</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
            Report issues, earn rewards, and work with local authorities to build a better neighborhood. Transparent, fast, and rewarding.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Get Started <ArrowRight size={20} />
            </Link>
            <button className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              View Live Map
            </button>
          </div>
        </motion.div>

        <section style={{ marginTop: '10rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <FeatureCard 
            icon={<Shield className="primary" />} 
            title="Secure Reporting" 
            desc="Encrypted reports directly to verified authorities and mediators."
          />
          <FeatureCard 
            icon={<MapPin style={{ color: '#ec4899' }} />} 
            title="Location Aware" 
            desc="Interactive maps help you find and support nearby community issues."
          />
          <FeatureCard 
            icon={<Award style={{ color: '#3b82f6' }} />} 
            title="Token Rewards" 
            desc="Earn tokens for every contribution. Redeem them for exclusive vouchers."
          />
        </section>
      </main>

      <div style={{ 
        position: 'fixed', top: '-10%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        zIndex: -1 
      }} />
      <div style={{ 
        position: 'fixed', bottom: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
        zIndex: -1 
      }} />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass" 
    style={{ padding: '3rem', borderRadius: '24px', textAlign: 'left' }}
  >
    <div style={{ marginBottom: '1.5rem', transform: 'scale(1.5)', display: 'inline-block' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </motion.div>
);

export default Home;
