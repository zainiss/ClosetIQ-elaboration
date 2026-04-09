import React, { useState } from 'react';
import { uploadPhoto } from '../../api/wardrobe';

const PhotoUpload = ({ onItemAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '',
    brand: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.category) {
      setError('Name and category are required');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('color', formData.color);
    data.append('brand', formData.brand);
    if (formData.image) {
      data.append('image', formData.image);
    }

    setLoading(true);

    try {
      await uploadPhoto(data);
      setFormData({ name: '', category: '', color: '', brand: '', image: null });
      setFileName('');
      onItemAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Item Name *</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. Blue Cotton T-shirt"
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
            placeholder="e.g. Blue"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="brand">Brand</label>
        <input
          id="brand"
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleInputChange}
          placeholder="e.g. Nike"
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Photo *</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        {fileName && <p className="file-name">{fileName}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Uploading...' : 'Add Item'}
      </button>
    </form>
  );
};

export default PhotoUpload;
