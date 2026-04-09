import React from 'react';

const CATEGORY_LABELS = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  outerwear: 'Outerwear',
  accessories: 'Accessories',
};

const OutfitResult = ({ items, label, outfit }) => {
  const itemList = Array.isArray(items) ? items : [items].filter(Boolean);

  return (
    <div className="outfit-result">
      {label && <div className="outfit-label">{label}</div>}

      {/* Structured outfit breakdown by category (PM-20) */}
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

      {/* Full item cards */}
      <div className="outfit-items">
        {itemList.length === 0 ? (
          <p className="no-items">No items in this outfit</p>
        ) : (
          itemList.map((item, idx) => (
            item && (
              <div key={item.id || idx} className="outfit-item">
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
                  {item.color && <p className="item-color">{item.color}</p>}
                  {item.brand && <p className="item-brand">{item.brand}</p>}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
};

export default OutfitResult;
