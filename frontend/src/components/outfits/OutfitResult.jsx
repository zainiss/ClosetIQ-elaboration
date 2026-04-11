import React, { useState } from 'react';
import { shareOutfit } from '../../api/social';

const CATEGORY_LABELS = {
  top:         'Top',
  bottom:      'Bottom',
  shoes:       'Shoes',
  outerwear:   'Outerwear',
  accessories: 'Accessories',
};

/* ── Share Modal ──────────────────────────────────────────────────────────── */
const ShareModal = ({ items, onClose }) => {
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    try {
      await shareOutfit(items, caption);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="share-modal">
        {success ? (
          <>
            <h2>Shared! 🎉</h2>
            <p style={{ color: 'var(--dark-gray)', marginBottom: '1.5rem' }}>
              Your outfit is now live in the Community Feed.
            </p>
            <div className="share-modal-actions">
              <button className="btn-share" onClick={onClose}>Done</button>
            </div>
          </>
        ) : (
          <>
            <h2>Share to Community</h2>
            <div className="share-modal-items">
              {items.map((item, idx) => (
                <span key={item.id || idx} className="share-item-pill">
                  {item.name}
                </span>
              ))}
            </div>
            <textarea
              className="share-caption-input"
              placeholder="Add a caption… (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={280}
            />
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)', marginBottom: '0.75rem' }}>{error}</p>
            )}
            <div className="share-modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-share" onClick={handleShare} disabled={loading}>
                {loading ? 'Sharing…' : 'Share Outfit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── OutfitResult ─────────────────────────────────────────────────────────── */
const OutfitResult = ({ items, label, outfit }) => {
  const itemList = Array.isArray(items) ? items : [items].filter(Boolean);
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="outfit-result">
      {label && <div className="outfit-label">{label}</div>}

      {/* Structured breakdown */}
      {outfit && Object.keys(outfit).length > 0 && (
        <div className="outfit-structure">
          <h4>Outfit Breakdown</h4>
          <div className="outfit-slots">
            {Object.entries(outfit).map(([slot, item]) =>
              item ? (
                <div key={slot} className="outfit-slot">
                  <span className="slot-label">{CATEGORY_LABELS[slot] || slot}</span>
                  <span className="slot-value">{item.name}</span>
                  {item.color && <span className="slot-color">{item.color}</span>}
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Item cards */}
      <div className="outfit-items">
        {itemList.length === 0 ? (
          <p className="no-items">No items in this outfit</p>
        ) : (
          itemList.map((item, idx) =>
            item ? (
              <div
                key={item.id || idx}
                className="outfit-item animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {item.image_path ? (
                  <img
                    src={`http://localhost:5000/uploads/${item.image_path.split('/').pop()}`}
                    alt={item.name}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="item-placeholder">
                    <span className="placeholder-category">{item.category || '?'}</span>
                  </div>
                )}
                <div className="item-details">
                  <p className="item-name">{item.name}</p>
                  {item.category && <p className="item-category">{item.category}</p>}
                  {item.color    && <p className="item-color">{item.color}</p>}
                  {item.brand    && <p className="item-brand">{item.brand}</p>}
                </div>
              </div>
            ) : null
          )
        )}
      </div>

      {/* Share button */}
      {itemList.length > 0 && (
        <button className="btn-share-outfit" onClick={() => setShowShare(true)}>
          🌐 Share to Community
        </button>
      )}

      {showShare && (
        <ShareModal items={itemList.filter(Boolean)} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
};

export default OutfitResult;
