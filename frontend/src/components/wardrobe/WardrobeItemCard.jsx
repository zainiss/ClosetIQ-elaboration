import React, { useState } from 'react';
import TagEditor from './TagEditor';
import { getApiBaseUrl } from '../../api/client';

const WardrobeItemCard = ({ item, onDelete, onTagsUpdated }) => {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="wardrobe-item-card">
      {/* Image with hover overlay */}
      <div className="item-image">
        {item.image_path && !imgError ? (
          <img
            src={`${getApiBaseUrl()}/wardrobe/uploads/${item.image_path}`}
            alt={item.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="placeholder">
            <span className="placeholder-icon">👕</span>
            <span>No Image</span>
          </div>
        )}
        <div className="image-overlay">
          <button
            className="overlay-delete"
            onClick={() => onDelete(item.id)}
            title="Delete item"
            aria-label={`Delete ${item.name}`}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="item-info">
        <h3 title={item.name}>{item.name}</h3>
        <div className="item-meta">
          {item.category && <span className="meta-badge category">{item.category}</span>}
          {item.color    && <span className="meta-badge color">{item.color}</span>}
          {item.brand    && <span className="meta-badge brand">{item.brand}</span>}
        </div>
      </div>

      {!isEditingTags ? (
        <>
          <div className="item-tags">
            {item.tags && item.tags.length > 0 ? (
              <div className="tags-list">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            ) : (
              <p className="no-tags">No tags yet</p>
            )}
          </div>

          <div className="item-actions">
            <button className="btn btn-secondary" onClick={() => setIsEditingTags(true)}>
              Edit Tags
            </button>
          </div>
        </>
      ) : (
        <TagEditor
          itemId={item.id}
          initialTags={item.tags || []}
          onSave={() => { setIsEditingTags(false); onTagsUpdated(); }}
          onCancel={() => setIsEditingTags(false)}
        />
      )}
    </div>
  );
};

export default WardrobeItemCard;
