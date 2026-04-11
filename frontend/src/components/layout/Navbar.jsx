import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import '../../styles/navbar.css';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const initials = user
    ? (user.username || user.email || '?').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/wardrobe" className="logo">
            <span className="logo-icon">👗</span>
            ClosetIQ
          </Link>
        </div>

        <ul className="navbar-links">
          <li>
            <Link to="/wardrobe" className={isActive('/wardrobe') ? 'active' : ''}>
              <span className="nav-icon">🗃️</span> Wardrobe
            </Link>
          </li>
          <li>
            <Link to="/outfits" className={isActive('/outfits') ? 'active' : ''}>
              <span className="nav-icon">✨</span> Outfits
            </Link>
          </li>
          <li>
            <Link to="/social" className={isActive('/social') ? 'active' : ''}>
              <span className="nav-icon">🌐</span> Community
            </Link>
          </li>
          {user && user.is_admin && (
            <li>
              <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                <span className="nav-icon">⚙️</span> Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-user">
          <Link to="/profile" className="user-avatar" title="Edit profile">{initials}</Link>
          {user && <span className="user-name">{user.username || user.email}</span>}
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
