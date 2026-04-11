import React, { useState, useEffect, useCallback } from 'react';
import { getFeed } from '../api/social';
import SharedOutfitCard from '../components/social/SharedOutfitCard';
import '../styles/social.css';

const PAGE_SIZE = 10;

const SocialPage = () => {
  const [outfits, setOutfits] = useState([]);
  const [sort, setSort] = useState('trending');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const loadFeed = useCallback(async (newSort, newOffset, replace) => {
    newOffset === 0 ? setLoading(true) : setLoadingMore(true);
    setError(null);
    try {
      const data = await getFeed(newSort, PAGE_SIZE, newOffset);
      setTotal(data.total);
      setOutfits((prev) => replace ? data.outfits : [...prev, ...data.outfits]);
      setOffset(newOffset + data.outfits.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setOffset(0);
    loadFeed(sort, 0, true);
  }, [sort, loadFeed]);

  const handleSortChange = (newSort) => {
    if (newSort === sort) return;
    setSort(newSort);
  };

  const handleDeleted = (id) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    setTotal((t) => t - 1);
  };

  const hasMore = outfits.length < total;

  return (
    <div className="social-page">
      {/* Header */}
      <div className="social-header animate-fadeIn">
        <div className="social-header-inner">
          <div>
            <h1>Community Feed</h1>
            <p>{total > 0 ? `${total} outfit${total !== 1 ? 's' : ''} shared` : 'Share and discover outfits'}</p>
          </div>
          <div className="sort-controls">
            <button
              className={`sort-btn${sort === 'trending' ? ' active' : ''}`}
              onClick={() => handleSortChange('trending')}
            >
              🔥 Trending
            </button>
            <button
              className={`sort-btn${sort === 'top' ? ' active' : ''}`}
              onClick={() => handleSortChange('top')}
            >
              ⭐ Top Rated
            </button>
          </div>
        </div>
      </div>

      <div className="social-body">
        {error && <div className="error-message animate-fadeIn">{error}</div>}

        {/* Loading skeleton */}
        {loading && (
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="outfit-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%' }} />
                    <div>
                      <div className="skeleton" style={{ width: '7rem', height: '0.85rem', marginBottom: '0.3rem', borderRadius: '0.5rem' }} />
                      <div className="skeleton" style={{ width: '4rem', height: '0.65rem', borderRadius: '0.5rem' }} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.5rem 1.25rem 1rem', display: 'flex', gap: '0.75rem' }}>
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="skeleton" style={{ width: '5.5rem', height: '5.5rem', borderRadius: '0.75rem', flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feed */}
        {!loading && outfits.length === 0 && (
          <div className="empty-feed">
            <span className="empty-feed-icon">👗</span>
            <h3>Nothing here yet</h3>
            <p>Generate an outfit and share it with the community!</p>
          </div>
        )}

        {!loading && outfits.map((outfit, idx) => (
          <SharedOutfitCard
            key={outfit.id}
            outfit={outfit}
            onDeleted={handleDeleted}
            style={{ animationDelay: `${Math.min(idx * 0.07, 0.5)}s` }}
          />
        ))}

        {/* Load more */}
        {!loading && hasMore && (
          <button
            className="load-more-btn"
            onClick={() => loadFeed(sort, offset, false)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
