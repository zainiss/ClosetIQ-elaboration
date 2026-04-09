import React, { useState, useEffect } from 'react';
import { getItems, deleteItem } from '../api/wardrobe';
import PhotoUpload from '../components/wardrobe/PhotoUpload';
import LinkSKUForm from '../components/wardrobe/LinkSKUForm';
import WardrobeItemCard from '../components/wardrobe/WardrobeItemCard';
import '../styles/wardrobe.css';

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
      <div className="wardrobe-header">
        <h1>My Wardrobe</h1>
        <p>{items.length} items in your closet</p>
      </div>

      <div className="wardrobe-content">
        <div className="add-item-section">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
              onClick={() => setActiveTab('photo')}
            >
              Upload Photo
            </button>
            <button
              className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
              onClick={() => setActiveTab('link')}
            >
              Add by Link/SKU
            </button>
          </div>

          {activeTab === 'photo' && (
            <PhotoUpload onItemAdded={handleItemAdded} />
          )}
          {activeTab === 'link' && (
            <LinkSKUForm onItemAdded={handleItemAdded} />
          )}
        </div>

        <div className="items-section">
          <h2>Items</h2>
          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <div className="loading">Loading your wardrobe...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>No items yet. Add your first item to get started!</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <WardrobeItemCard
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                  onTagsUpdated={() => setRefreshTrigger((prev) => prev + 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardrobePage;
