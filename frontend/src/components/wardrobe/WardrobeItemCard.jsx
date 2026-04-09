import React, { useState } from 'react';
import TagEditor from './TagEditor';

const WardrobeItemCard = ({ item, onDelete, onTagsUpdated }) => {
  const [isEditingTags, setIsEditingTags] = useState(false);

  const handleEditTags = () => {
    setIsEditingTags(true);
  };

  const handleTagsSaved = () => {
    setIsEditingTags(false);
    onTagsUpdated();
  };

  const handleCancel = () => {
    setIsEditingTags(false);
  };

  return (
    <div className="wardrobe-item-card">
      <div className="item-image">
        {item.image_path ? (
          <img src={process.env.REACT_APP_API_URL + '/wardrobe/uploads/' + item.image_path} alt={item.name} />
        ) : (
          <div className="placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>

      <div className="item-info">
        <h3>{item.name}</h3>
        {item.category && <p className="category">Category: {item.category}</p>}
        {item.color && <p className="color">Color: {item.color}</p>}
        {item.brand && <p className="brand">Brand: {item.brand}</p>}
      </div>

      {!isEditingTags ? (
        <>
          <div className="item-tags">
            {item.tags && item.tags.length > 0 ? (
              <div className="tags-list">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-tags">No tags</p>
            )}
          </div>

          <div className="item-actions">
            <button className="btn btn-secondary" onClick={handleEditTags}>
              Edit Tags
            </button>
            <button
              className="btn btn-ghost delete"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <TagEditor
          itemId={item.id}
          initialTags={item.tags || []}
          onSave={handleTagsSaved}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default WardrobeItemCard;
