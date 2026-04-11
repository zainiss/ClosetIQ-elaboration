import React, { useState } from 'react';

const RatingStars = ({ current, count, onRate, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);

  const display = hovered || current || 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn${display >= star ? ' filled' : ''}`}
            onClick={() => !readOnly && onRate && onRate(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            disabled={readOnly}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className="rating-label">
          {current ? current.toFixed(1) : '—'} ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
