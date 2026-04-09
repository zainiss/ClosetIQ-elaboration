import React from 'react';

const OutfitResult = ({ items, label }) => {
  const itemList = Array.isArray(items) ? items : [items];

  return (
    <div className="outfit-result">
      <div className="outfit-label">{label}</div>
      <div className="outfit-items">
        {itemList.length === 0 ? (
          <p className="no-items">No items in this outfit</p>
        ) : (
          itemList.map((item, idx) => (
            <div key={idx} className="outfit-item">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} />
              ) : (
                <div className="item-placeholder">
                  <span>No Image</span>
                </div>
              )}
              <div className="item-details">
                <p className="item-name">{item.name}</p>
                {item.category && (
                  <p className="item-category">{item.category}</p>
                )}
                {item.color && <p className="item-color">{item.color}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OutfitResult;
