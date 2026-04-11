import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import '../styles/profile.css';

const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const initials = (user?.username || user?.email || '?').slice(0, 2).toUpperCase();
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateUser({ username: username.trim(), bio: bio.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const bioRemaining = 300 - bio.length;

  return (
    <div className="profile-page">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar-large">{initials}</div>
        <h1>{user?.username}</h1>
        <p className="profile-hero-email">{user?.email}</p>
        {user?.bio && <p className="profile-hero-bio">{user.bio}</p>}
        <div className="profile-hero-meta">
          {user?.is_admin && <span>⚙️ Admin</span>}
          {joinDate && <span>📅 Joined {joinDate}</span>}
        </div>
      </div>

      {/* Edit form */}
      <div className="profile-body">
        <div className="profile-card">
          <h2>Edit Profile</h2>

          {success && <div className="profile-success">✓ Profile updated!</div>}
          {error   && <div className="profile-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="profile-form-group">
              <label htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                minLength={3}
                maxLength={80}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a little about your style…"
                maxLength={300}
              />
              <div className={`profile-char-count${bioRemaining <= 40 ? ' near-limit' : ''}`}>
                {bioRemaining} characters remaining
              </div>
            </div>

            <button type="submit" className="profile-save-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
