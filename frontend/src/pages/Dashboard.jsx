import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Map, ListTodo, ShieldCheck, 
  LogOut, Ticket, User as UserIcon, Route as RouteIcon,
  Trophy, Activity, Newspaper
} from 'lucide-react';

// Sub-dashboards
import AuthorityDashboard from './AuthorityDashboard';
import Profile from './Profile';
import CitizenOverview from './CitizenOverview';
import MapView from './MapView';
import MyActivity from './MyActivity';
import Leaderboard from './Leaderboard';
import Rewards from './Rewards';
import CitizenDashboard from './CitizenDashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Sidebar (Desktop) */}
      <aside className="glass desktop-sidebar" style={{ 
        width: '280px', margin: '1rem', borderRadius: '24px', 
        display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem',
        position: 'sticky', top: '1rem', height: 'calc(100vh - 2rem)'
      }}>
        <div className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '3rem', paddingLeft: '1rem', background: 'linear-gradient(to right, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SAHARA
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {user?.role === 'citizen' && (
            <>
              <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
              <SidebarLink to="/dashboard/feed" icon={<Newspaper size={20} />} label="Community Feed" />
              <SidebarLink to="/dashboard/activity" icon={<Activity size={20} />} label="My Activity" />
              <SidebarLink to="/dashboard/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" />
              <SidebarLink to="/dashboard/rewards" icon={<Ticket size={20} />} label="Rewards" />
            </>
          )}

          {user?.role === 'authority' && (
            <SidebarLink to="/dashboard" icon={<ListTodo size={20} />} label="Department Tasks" />
          )}

          <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border-glass)' }} />
          <SidebarLink to="/dashboard/profile" icon={<UserIcon size={20} />} label="Profile" />
        </nav>

        <button 
          onClick={handleLogout}
          className="btn btn-outline" 
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', borderColor: 'transparent' }}
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, padding: '2rem 3rem 2rem 1rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Welcome, {user?.name || 'User'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{(user?.role || '').charAt(0).toUpperCase() + (user?.role || '').slice(1)} Dashboard</p>
          </div>
          <div className="glass" style={{ padding: '0.5rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }} />
            <span style={{ fontSize: '0.9rem' }}>{user?.email || ''}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '0.5rem' }} className="bottom-nav">
               <LogOut size={16} />
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<RoleDispatcher role={user?.role} />} />
          <Route path="/feed" element={<CitizenDashboard />} />
          <Route path="/activity" element={<MyActivity />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/full-map" element={<MapView />} />
        </Routes>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        {user?.role === 'citizen' && (
          <>
            <BottomNavLink to="/dashboard" icon={<LayoutDashboard size={22} />} label="Home" />
            <BottomNavLink to="/dashboard/feed" icon={<Newspaper size={22} />} label="Feed" />
            <BottomNavLink to="/dashboard/activity" icon={<Activity size={22} />} label="Activity" />
            <BottomNavLink to="/dashboard/rewards" icon={<Ticket size={22} />} label="Rewards" />
          </>
        )}
        {user?.role === 'authority' && (
          <BottomNavLink to="/dashboard" icon={<ListTodo size={22} />} label="Tasks" />
        )}
        <BottomNavLink to="/dashboard/profile" icon={<UserIcon size={22} />} label="Profile" />
      </nav>
    </div>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <Link to={to} style={{ 
    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
    borderRadius: '12px', textDecoration: 'none', color: 'var(--text-muted)',
    transition: 'var(--transition)'
  }} className="nav-link">
    {icon}
    <span style={{ fontWeight: 500 }}>{label}</span>
  </Link>
);

const BottomNavLink = ({ to, icon, label }) => {
  // Check if active (simple string matching for now)
  const isActive = window.location.pathname === to || (to !== '/dashboard' && window.location.pathname.startsWith(to));
  
  return (
    <Link to={to} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const RoleDispatcher = ({ role }) => {
  switch(role) {
    case 'citizen': return <CitizenOverview />;
    case 'authority': return <AuthorityDashboard />;
    default: return <div>Invalid Role</div>;
  }
};

export default Dashboard;
