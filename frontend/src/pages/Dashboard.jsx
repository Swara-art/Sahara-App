import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Map, ListTodo, ShieldCheck, 
  LogOut, Ticket, User as UserIcon, Route as RouteIcon,
  Trophy, Activity
} from 'lucide-react';

// Sub-dashboards
const AdminDashboard = React.lazy(() => import('./AdminDashboard'));
const MediatorDashboard = React.lazy(() => import('./MediatorDashboard'));
const AuthorityDashboard = React.lazy(() => import('./AuthorityDashboard'));
const Profile = React.lazy(() => import('./Profile'));
const CitizenOverview = React.lazy(() => import('./CitizenOverview'));
const MapView = React.lazy(() => import('./MapView'));
const MyActivity = React.lazy(() => import('./MyActivity'));
const Leaderboard = React.lazy(() => import('./Leaderboard'));
const Rewards = React.lazy(() => import('./Rewards'));

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Sidebar */}
      <aside className="glass" style={{ 
        width: '280px', margin: '1rem', borderRadius: '24px', 
        display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem',
        position: 'sticky', top: '1rem', height: 'calc(100vh - 2rem)'
      }}>
        <div className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '3rem', paddingLeft: '1rem', background: 'linear-gradient(to right, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SAHARA
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(user?.role !== 'admin' && user?.role !== 'mediator') && (
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
          )}
          
          {user?.role === 'citizen' && (
            <>
              <SidebarLink to="/dashboard/activity" icon={<Activity size={20} />} label="My Activity" />
              <SidebarLink to="/dashboard/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" />
              <SidebarLink to="/dashboard/rewards" icon={<Ticket size={20} />} label="Rewards" />
            </>
          )}

          {user?.role === 'admin' && (
            <SidebarLink to="/dashboard" icon={<ShieldCheck size={20} />} label="Review Queue" />
          )}

          {user?.role === 'mediator' && (
            <SidebarLink to="/dashboard" icon={<RouteIcon size={20} />} label="Assignment Board" />
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
      <main style={{ flex: 1, padding: '2rem 3rem 2rem 1rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Welcome, {user?.name || 'User'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{(user?.role || '').charAt(0).toUpperCase() + (user?.role || '').slice(1)} Dashboard</p>
          </div>
          <div className="glass" style={{ padding: '0.5rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }} />
            <span style={{ fontSize: '0.9rem' }}>{user?.email || ''}</span>
          </div>
        </header>

        <React.Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading section...</div>}>
          <Routes>
            <Route path="/" element={<RoleDispatcher role={user?.role} />} />
            <Route path="/activity" element={<MyActivity />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/full-map" element={<MapView />} />
          </Routes>
        </React.Suspense>
      </main>
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

const RoleDispatcher = ({ role }) => {
  switch(role) {
    case 'citizen': return <CitizenOverview />;
    case 'admin': return <AdminDashboard />;
    case 'mediator': return <MediatorDashboard />;
    case 'authority': return <AuthorityDashboard />;
    default: return <div>Invalid Role</div>;
  }
};

export default Dashboard;
