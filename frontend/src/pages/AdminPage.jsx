import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { listUsers, deactivateUser, activateUser, deleteUser, getActivity, getStats } from '../api/admin';
import '../styles/global.css';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'users') {
        const data = await listUsers();
        setUsers(Array.isArray(data) ? data : []);
      } else if (tab === 'activity') {
        const data = await getActivity(50);
        setActivityLogs(data.logs || []);
      } else if (tab === 'stats') {
        const data = await getStats();
        setStats(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data — are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]); // eslint-disable-line

  const handleDeactivate = async (userId) => {
    try {
      await deactivateUser(userId);
      setMessage('User deactivated');
      load();
    } catch (err) { setError(err.message); }
  };

  const handleActivate = async (userId) => {
    try {
      await activateUser(userId);
      setMessage('User activated');
      load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}" and all their data? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      setMessage(`User ${username} deleted`);
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>System management and monitoring</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message" onClick={() => setMessage(null)}>{message} ✕</div>}

      <div className="tab-bar">
        {['users', 'activity', 'stats'].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Loading...</div>}

      {/* Users Tab */}
      {!loading && tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={!u.is_active ? 'row-inactive' : ''}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.is_admin ? '✓' : '—'}</td>
                  <td>
                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="action-cell">
                    {u.is_active ? (
                      <button className="btn-sm btn-warn" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                    ) : (
                      <button className="btn-sm btn-ok" onClick={() => handleActivate(u.id)}>Activate</button>
                    )}
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id, u.username)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="no-results">No users found</p>}
        </div>
      )}

      {/* Activity Tab */}
      {!loading && tab === 'activity' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User ID</th>
                <th>Action</th>
                <th>IP</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.user_id ?? '—'}</td>
                  <td><code>{log.action}</code></td>
                  <td>{log.ip_address ?? '—'}</td>
                  <td>{log.details ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {activityLogs.length === 0 && <p className="no-results">No activity logs yet</p>}
        </div>
      )}

      {/* Stats Tab */}
      {!loading && tab === 'stats' && stats && (
        <div className="stats-grid">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-card">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{key.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
