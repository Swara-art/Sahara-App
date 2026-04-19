import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import './Navbar.css';

export default function Navbar({ onSearch, showSearch = false }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏔️</span>
          <span className="logo-text">Sahara</span>
        </Link>

        {/* Search (center, only on homepage) */}
        {showSearch && (
          <div className="navbar-search">
            <SearchBar onSearch={onSearch} />
          </div>
        )}

        {/* Right actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="btn btn-ghost btn-sm" title="My Profile">
                <span>👤</span>
                <span className="hide-mobile">Profile</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <span>🚪</span>
                <span className="hide-mobile">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
