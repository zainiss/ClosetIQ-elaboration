import React, { useState, useEffect } from 'react';
import { getItems, deleteItem } from '../api/wardrobe';
import PhotoUpload from '../components/wardrobe/PhotoUpload';
import LinkSKUForm from '../components/wardrobe/LinkSKUForm';
import WardrobeItemCard from '../components/wardrobe/WardrobeItemCard';
import '../styles/wardrobe.css';

const SkeletonCard = () => (
  <div className="wardrobe-item-card skeleton-card">
    <div className="skeleton item-image" style={{ height: 175 }} />
    <div style={{ padding: '0.875rem' }}>
      <div className="skeleton" style={{ height: '0.9rem', width: '65%', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '0.7rem', width: '45%', marginBottom: '0.35rem' }} />
      <div className="skeleton" style={{ height: '0.7rem', width: '35%' }} />
    </div>
  </div>
);

const WardrobePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('photo');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getItems();
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [refreshTrigger]);

  const handleItemAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('photo');
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      } catch (err) {
        alert(`Failed to delete item: ${err.message}`);
      }
    }
  };

  return (
    <div className="wardrobe-page">
      <div className="wardrobe-header animate-fadeIn">
        <div className="wardrobe-header-inner">
          <div>
            <h1>My Wardrobe</h1>
            <p>
              {loading
                ? 'Loading your items…'
                : `${items.length} item${items.length !== 1 ? 's' : ''} in your closet`}
            </p>
          </div>
          <div className="wardrobe-stats">
            <div className="wstat">
              <span className="wstat-icon">👕</span>
              <span className="wstat-num">{loading ? '—' : items.length}</span>
              <span className="wstat-label">Items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wardrobe-content">
        {/* Add Item Panel */}
        <div className="add-item-section animate-fadeInUp">
          <p className="panel-title">Add Item</p>
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
              onClick={() => setActiveTab('photo')}
            >
              📷 Photo
            </button>
            <button
              className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
              onClick={() => setActiveTab('link')}
            >
              🔗 Link / SKU
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'photo' && <PhotoUpload onItemAdded={handleItemAdded} />}
            {activeTab === 'link'  && <LinkSKUForm onItemAdded={handleItemAdded} />}
          </div>
        </div>

        {/* Items Grid */}
        <div className="items-section animate-fadeInUp delay-1">
          <div className="items-section-header">
            <h2>Your Items</h2>
            {items.length > 0 && (
              <span className="items-count">{items.length}</span>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="items-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👗</div>
              <h3>Your closet is empty</h3>
              <p>Add your first item to get started with outfit recommendations!</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${Math.min(idx * 0.05, 0.4)}s` }}
                >
                  <WardrobeItemCard
                    item={item}
                    onDelete={handleDeleteItem}
                    onTagsUpdated={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardrobePage;
