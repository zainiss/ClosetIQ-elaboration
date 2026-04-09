import React, { useState } from 'react';
import { addByLink } from '../../api/wardrobe';

const LinkSKUForm = ({ onItemAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    source_url: '',
    sku: '',
    color: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Shirt',
    'Pants',
    'Dress',
    'Jacket',
    'Shoes',
    'Accessory',
    'Underwear',
    'Outerwear',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await addByLink(formData);
      setFormData({ name: '', category: '', source_url: '', sku: '', color: '' });
      onItemAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="link-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Item Name *</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. Designer Blazer"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input
            id="color"
            type="text"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            placeholder="e.g. Navy"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="sku">SKU</label>
        <input
          id="sku"
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleInputChange}
          placeholder="e.g. SKU123456"
        />
      </div>

      <div className="form-group">
        <label htmlFor="source_url">Source URL</label>
        <input
          id="source_url"
          type="url"
          name="source_url"
          value={formData.source_url}
          onChange={handleInputChange}
          placeholder="https://example.com/product"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Adding...' : 'Add Item'}
      </button>
    </form>
  );
};

export default LinkSKUForm;
