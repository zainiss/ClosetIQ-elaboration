import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import '../../styles/navbar.css';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/wardrobe" className="logo">
            ClosetIQ
          </Link>
        </div>

        <ul className="navbar-links">
          <li>
            <Link to="/wardrobe">Wardrobe</Link>
          </li>
          <li>
            <Link to="/outfits">Outfits</Link>
          </li>
          {user && user.is_admin && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}
        </ul>

        <div className="navbar-user">
          {user && <span className="user-name">{user.username || user.email}</span>}
          <button className="btn btn-ghost logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
