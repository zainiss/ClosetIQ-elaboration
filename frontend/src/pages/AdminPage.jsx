import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../AuthContext';
import {
  listUsers, deactivateUser, activateUser, deleteUser, getActivity, getStats,
  listSharedOutfits, hideOutfit, unhideOutfit, adminDeleteOutfit,
  listFlaggedComments, dismissFlag, adminDeleteComment,
} from '../api/admin';
import '../styles/global.css';
import '../styles/social.css';

/* Animated number counter */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : 0;
    if (target === 0) { setDisplay(0); return; }
    const duration = 700;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplay(Math.round(ease * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{display}</>;
};

const STAT_ICONS = {
  total_users:   '👥',
  active_users:  '✅',
  total_items:   '👕',
  total_outfits: '✨',
  total_logs:    '📋',
};

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [sharedOutfits, setSharedOutfits] = useState([]);
  const [flaggedComments, setFlaggedComments] = useState([]);
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
      } else if (tab === 'moderation') {
        const [outfitsData, commentsData] = await Promise.all([
          listSharedOutfits(50),
          listFlaggedComments(),
        ]);
        setSharedOutfits(outfitsData.outfits || []);
        setFlaggedComments(Array.isArray(commentsData) ? commentsData : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data — are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]); // eslint-disable-line

  const handleDeactivate = async (userId) => {
    try { await deactivateUser(userId); setMessage('User deactivated'); load(); }
    catch (err) { setError(err.message); }
  };

  const handleActivate = async (userId) => {
    try { await activateUser(userId); setMessage('User activated'); load(); }
    catch (err) { setError(err.message); }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}" and all their data? This cannot be undone.`)) return;
    try { await deleteUser(userId); setMessage(`User ${username} deleted`); load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="admin-page">
      {/* Gradient header */}
      <div className="admin-header animate-fadeIn">
        <div className="admin-header-inner">
          <div>
            <h1>Admin Panel</h1>
            <p>System management and monitoring</p>
          </div>
          <div className="admin-badge">
            <span>⚙️</span>
            <span>{user?.username || 'Admin'}</span>
          </div>
        </div>
      </div>

      <div className="admin-body">
        {error   && <div className="error-message animate-fadeIn">{error}</div>}
        {message && (
          <div
            className="success-message animate-fadeIn"
            onClick={() => setMessage(null)}
            style={{ cursor: 'pointer' }}
          >
            {message} <span style={{ opacity: 0.6 }}>✕</span>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar">
          {[
            { key: 'users',      icon: '👥', label: 'Users' },
            { key: 'activity',   icon: '📋', label: 'Activity' },
            { key: 'stats',      icon: '📊', label: 'Stats' },
            { key: 'moderation', icon: '🛡️', label: 'Moderation' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              className={`tab-btn ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              <span className="tab-icon">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading {tab}…</span>
          </div>
        )}

        {/* Users tab */}
        {!loading && tab === 'users' && (
          <div className="admin-table-wrap animate-fadeInUp">
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
                    <td><span className="id-badge">#{u.id}</span></td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      {u.is_admin
                        ? <span className="admin-tick">✓</span>
                        : <span style={{ color: 'var(--medium-gray)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                        {u.is_active ? '● Active' : '○ Inactive'}
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

        {/* Activity tab */}
        {!loading && tab === 'activity' && (
          <div className="admin-table-wrap animate-fadeInUp">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>IP</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-sm">{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.user_id ?? <span style={{ color: 'var(--medium-gray)' }}>—</span>}</td>
                    <td><span className="action-badge">{log.action}</span></td>
                    <td>{log.ip_address ?? <span style={{ color: 'var(--medium-gray)' }}>—</span>}</td>
                    <td className="text-sm">{log.details ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activityLogs.length === 0 && <p className="no-results">No activity logs yet</p>}
          </div>
        )}

        {/* Stats tab */}
        {!loading && tab === 'stats' && stats && (
          <div className="stats-grid animate-fadeInUp">
            {Object.entries(stats).map(([key, value], idx) => (
              <div
                key={key}
                className="stat-card"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <span className="stat-icon">{STAT_ICONS[key] || '📌'}</span>
                <div className="stat-value">
                  {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
                </div>
                <div className="stat-label">{key.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        )}

        {/* Moderation tab */}
        {!loading && tab === 'moderation' && (
          <div className="animate-fadeInUp">

            {/* Shared outfits */}
            <div className="moderation-section">
              <h3>🌐 Shared Outfits <span style={{ fontSize: 'var(--font-sm)', fontWeight: 400, color: 'var(--medium-gray)' }}>({sharedOutfits.length})</span></h3>
              {sharedOutfits.length === 0 && <p className="no-results">No shared outfits yet</p>}
              {sharedOutfits.map((o) => (
                <div key={o.id} className={`outfit-mod-card${o.is_hidden ? ' hidden-card' : ''}`}>
                  <div className="outfit-mod-info">
                    <div className="outfit-mod-user">@{o.username}</div>
                    <div className="outfit-mod-caption">{o.caption || <em style={{ color: 'var(--medium-gray)' }}>No caption</em>}</div>
                    <div className="outfit-mod-meta">
                      {o.items?.length || 0} items · ⭐ {o.avg_rating || 0} ({o.rating_count} ratings) · 💬 {o.comment_count}
                      {o.is_hidden && <span style={{ color: 'var(--danger)', marginLeft: '0.5rem' }}>● Hidden</span>}
                    </div>
                  </div>
                  <div className="outfit-mod-actions">
                    {o.is_hidden ? (
                      <button
                        className="btn-sm btn-ok"
                        onClick={async () => {
                          try { await unhideOutfit(o.id); setMessage('Outfit restored'); load(); }
                          catch (err) { setError(err.message); }
                        }}
                      >Restore</button>
                    ) : (
                      <button
                        className="btn-sm btn-warn"
                        onClick={async () => {
                          try { await hideOutfit(o.id); setMessage('Outfit hidden'); load(); }
                          catch (err) { setError(err.message); }
                        }}
                      >Hide</button>
                    )}
                    <button
                      className="btn-sm btn-danger"
                      onClick={async () => {
                        if (!window.confirm('Permanently delete this shared outfit?')) return;
                        try { await adminDeleteOutfit(o.id); setMessage('Outfit deleted'); load(); }
                        catch (err) { setError(err.message); }
                      }}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Flagged comments */}
            <div className="moderation-section">
              <h3>🚩 Flagged Comments <span style={{ fontSize: 'var(--font-sm)', fontWeight: 400, color: 'var(--medium-gray)' }}>({flaggedComments.length})</span></h3>
              {flaggedComments.length === 0 && <p className="no-results">No flagged comments</p>}
              {flaggedComments.map((c) => (
                <div key={c.id} className="flagged-comment-card">
                  <div className="flagged-comment-meta">@{c.username} · Outfit #{c.shared_outfit_id} · {new Date(c.created_at).toLocaleString()}</div>
                  <div className="flagged-comment-text">{c.text}</div>
                  <div className="flagged-comment-actions">
                    <button
                      className="btn-sm btn-ok"
                      onClick={async () => {
                        try { await dismissFlag(c.id); setMessage('Flag dismissed'); load(); }
                        catch (err) { setError(err.message); }
                      }}
                    >Dismiss</button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={async () => {
                        try { await adminDeleteComment(c.id); setMessage('Comment deleted'); load(); }
                        catch (err) { setError(err.message); }
                      }}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
