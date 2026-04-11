import React, { useContext, useState } from 'react';
import { AuthContext } from '../../AuthContext';
import { rateOutfit, deleteShare } from '../../api/social';
import RatingStars from './RatingStars';
import CommentSection from './CommentSection';

const CATEGORY_EMOJI = {
  top: '👕', bottom: '👖', shoes: '👟', outerwear: '🧥', accessories: '💍',
};

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const SharedOutfitCard = ({ outfit: initial, onDeleted, style }) => {
  const { user } = useContext(AuthContext);
  const [outfit, setOutfit] = useState(initial);
  const [showComments, setShowComments] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const initials = (username) => (username || '?').slice(0, 2).toUpperCase();

  const handleRate = async (stars) => {
    if (ratingLoading) return;
    setRatingLoading(true);
    try {
      const res = await rateOutfit(outfit.id, stars);
      setOutfit((prev) => ({
        ...prev,
        avg_rating: res.avg_rating,
        rating_count: res.rating_count,
        my_rating: res.my_rating,
      }));
    } catch {
      // silently ignore
    } finally {
      setRatingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this shared outfit?')) return;
    try {
      await deleteShare(outfit.id);
      onDeleted && onDeleted(outfit.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const canDelete = user && (user.id === outfit.user_id || user.is_admin);
  const items = Array.isArray(outfit.items) ? outfit.items : [];

  return (
    <div className="outfit-card" style={style}>
      {/* Header */}
      <div className="card-header">
        <div className="card-user">
          <div className="card-avatar">{initials(outfit.username)}</div>
          <div>
            <div className="card-username">{outfit.username}</div>
            <div className="card-time">{timeAgo(outfit.created_at)}</div>
          </div>
        </div>
        {canDelete && (
          <button className="card-menu-btn" onClick={handleDelete} title="Remove">✕</button>
        )}
      </div>

      {/* Caption */}
      {outfit.caption && <div className="card-caption">{outfit.caption}</div>}

      {/* Items */}
      {items.length > 0 && (
        <div className="card-items">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="card-item">
              {item.image_path ? (
                <img
                  className="card-item-img"
                  src={`http://localhost:5000/uploads/${item.image_path.split('/').pop()}`}
                  alt={item.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="card-item-placeholder">
                  {CATEGORY_EMOJI[item.category] || '👔'}
                </div>
              )}
              <div className="card-item-name">{item.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer: rating + comments toggle */}
      <div className="card-footer">
        <RatingStars
          current={outfit.avg_rating}
          count={outfit.rating_count}
          onRate={handleRate}
          readOnly={ratingLoading}
        />
        {outfit.my_rating !== undefined && outfit.my_rating !== null && (
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--medium-gray)' }}>
            (you: {outfit.my_rating}★)
          </span>
        )}
        <button
          className="comment-toggle-btn"
          onClick={() => setShowComments((v) => !v)}
          style={{ marginLeft: 'auto' }}
        >
          💬 {outfit.comment_count}{showComments ? ' ▲' : ' ▼'}
        </button>
      </div>

      {/* Comment section (lazy) */}
      {showComments && <CommentSection outfitId={outfit.id} />}
    </div>
  );
};

export default SharedOutfitCard;
