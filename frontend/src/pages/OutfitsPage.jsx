import React, { useState, useEffect } from 'react';
import { getByOccasion, getByWeather, getByDressCode, getByColor, getWithItem, getMultipleOutfits, getWithShoes } from '../api/outfits';
import { getItems } from '../api/wardrobe';
import OutfitResult from '../components/outfits/OutfitResult';
import '../styles/outfits.css';

const OutfitsPage = () => {
  const [error, setError] = useState(null);

  // By Occasion
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [occasionResults, setOccasionResults] = useState(null);
  const [occasionLoading, setOccasionLoading] = useState(false);

  // By Weather
  const [temperature, setTemperature] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('');
  const [weatherResults, setWeatherResults] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // By Dress Code
  const [selectedDressCode, setSelectedDressCode] = useState(null);
  const [dressCodeResults, setDressCodeResults] = useState(null);
  const [dressCodeLoading, setDressCodeLoading] = useState(false);

  // By Color
  const [colorInput, setColorInput] = useState('');
  const [colorResults, setColorResults] = useState(null);
  const [colorLoading, setColorLoading] = useState(false);

  // With Shoes
  const [shoesOccasion, setShoesOccasion] = useState('');
  const [shoesResults, setShoesResults] = useState(null);
  const [shoesLoading, setShoesLoading] = useState(false);

  // Multiple Options
  const [multipleOccasion, setMultipleOccasion] = useState('');
  const [multipleResults, setMultipleResults] = useState(null);
  const [multipleLoading, setMultipleLoading] = useState(false);

  // Must-Use Item
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [mustUseItemId, setMustUseItemId] = useState('');
  const [mustUseResults, setMustUseResults] = useState(null);
  const [mustUseLoading, setMustUseLoading] = useState(false);

  const occasions = ['Casual', 'Work', 'Wedding', 'Gym', 'Date Night'];
  const weatherConditions = ['Sunny', 'Rainy', 'Cold', 'Hot'];
  const dressCodes = ['Formal', 'Semi-Formal', 'Business Casual', 'Smart Casual', 'Casual'];

  useEffect(() => {
    getItems().then(setWardrobeItems).catch(() => {});
  }, []);

  const handleOccasionClick = async (occasion) => {
    if (selectedOccasion === occasion) {
      setSelectedOccasion(null);
      setOccasionResults(null);
      return;
    }
    setSelectedOccasion(occasion);
    setOccasionLoading(true);
    setError(null);
    try {
      const results = await getByOccasion(occasion);
      setOccasionResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setOccasionLoading(false);
    }
  };

  const handleWeatherSubmit = async (e) => {
    e.preventDefault();
    if (!temperature && !selectedWeather) return;
    setWeatherLoading(true);
    setError(null);
    try {
      const results = await getByWeather(
        temperature ? parseFloat(temperature) : undefined,
        selectedWeather || undefined
      );
      setWeatherResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleDressCodeClick = async (dressCode) => {
    if (selectedDressCode === dressCode) {
      setSelectedDressCode(null);
      setDressCodeResults(null);
      return;
    }
    setSelectedDressCode(dressCode);
    setDressCodeLoading(true);
    setError(null);
    try {
      const results = await getByDressCode(dressCode);
      setDressCodeResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setDressCodeLoading(false);
    }
  };

  const handleShoesSubmit = async (e) => {
    e.preventDefault();
    setShoesLoading(true);
    setError(null);
    try {
      const results = await getWithShoes(shoesOccasion || null);
      setShoesResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setShoesLoading(false);
    }
  };

  const handleMultipleSubmit = async (e) => {
    e.preventDefault();
    setMultipleLoading(true);
    setError(null);
    try {
      const results = await getMultipleOutfits(multipleOccasion || null, 3);
      setMultipleResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setMultipleLoading(false);
    }
  };

  const handleColorSubmit = async (e) => {
    e.preventDefault();
    if (!colorInput.trim()) return;
    setColorLoading(true);
    setError(null);
    try {
      const results = await getByColor(colorInput.trim());
      setColorResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setColorLoading(false);
    }
  };

  const handleMustUseSubmit = async (e) => {
    e.preventDefault();
    if (!mustUseItemId) return;
    setMustUseLoading(true);
    setError(null);
    try {
      const results = await getWithItem(parseInt(mustUseItemId));
      setMustUseResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setMustUseLoading(false);
    }
  };

  const renderResults = (results, label) => {
    if (!results) return null;
    const items = Array.isArray(results) ? results : results.items || [];
    return (
      <div className="results">
        {items.length === 0 ? (
          <p className="no-results">No items found</p>
        ) : (
          <OutfitResult items={items} label={label} outfit={results.outfit} />
        )}
      </div>
    );
  };

  return (
    <div className="outfits-page">
      <div className="outfits-header">
        <h1>Outfit Recommendations</h1>
        <p>Get personalized outfit suggestions based on your needs</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="recommendations-grid">

        {/* By Occasion */}
        <section className="recommendation-section">
          <h2>By Occasion</h2>
          <div className="buttons-group">
            {occasions.map((occasion) => (
              <button
                key={occasion}
                className={`occasion-btn ${selectedOccasion === occasion ? 'active' : ''}`}
                onClick={() => handleOccasionClick(occasion)}
              >
                {occasion}
              </button>
            ))}
          </div>
          {occasionLoading && <div className="loading">Finding outfits...</div>}
          {renderResults(occasionResults, `Occasion: ${selectedOccasion}`)}
        </section>

        {/* By Weather */}
        <section className="recommendation-section">
          <h2>By Weather</h2>
          <form className="weather-form" onSubmit={handleWeatherSubmit}>
            <div className="form-row">
              <input
                type="number"
                placeholder="Temperature (°C)"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="temp-input"
              />
              <select
                value={selectedWeather}
                onChange={(e) => setSelectedWeather(e.target.value)}
                className="condition-select"
              >
                <option value="">Any condition</option>
                {weatherConditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button type="submit" className="submit-btn">Get Outfit</button>
            </div>
          </form>
          {weatherLoading && <div className="loading">Finding outfits...</div>}
          {renderResults(weatherResults, `Weather: ${selectedWeather || (temperature && temperature + '°C')}`)}
        </section>

        {/* By Dress Code */}
        <section className="recommendation-section">
          <h2>By Dress Code</h2>
          <div className="buttons-group">
            {dressCodes.map((code) => (
              <button
                key={code}
                className={`occasion-btn ${selectedDressCode === code ? 'active' : ''}`}
                onClick={() => handleDressCodeClick(code)}
              >
                {code}
              </button>
            ))}
          </div>
          {dressCodeLoading && <div className="loading">Finding outfits...</div>}
          {renderResults(dressCodeResults, `Dress Code: ${selectedDressCode}`)}
        </section>

        {/* Include Shoes (PM-14) */}
        <section className="recommendation-section">
          <h2>Complete Look with Shoes</h2>
          <p className="section-description">Get a full outfit recommendation that always includes footwear.</p>
          <form className="weather-form" onSubmit={handleShoesSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Occasion (optional)"
                value={shoesOccasion}
                onChange={(e) => setShoesOccasion(e.target.value)}
                className="temp-input"
              />
              <button type="submit" className="submit-btn">Get Complete Look</button>
            </div>
          </form>
          {shoesLoading && <div className="loading">Building complete look...</div>}
          {shoesResults && (
            <div className="results">
              {!shoesResults.shoe_included && (
                <p className="warning-message">No shoes found in your wardrobe — add some for complete looks!</p>
              )}
              <OutfitResult
                items={shoesResults.items || []}
                outfit={shoesResults.outfit}
                label={`Complete Look${shoesOccasion ? ` — ${shoesOccasion}` : ''}`}
              />
            </div>
          )}
        </section>

        {/* Multiple Outfit Options (PM-13) */}
        <section className="recommendation-section">
          <h2>Multiple Outfit Options</h2>
          <p className="section-description">Generate 3 different outfit combinations to choose from.</p>
          <form className="weather-form" onSubmit={handleMultipleSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Occasion (optional)"
                value={multipleOccasion}
                onChange={(e) => setMultipleOccasion(e.target.value)}
                className="temp-input"
              />
              <button type="submit" className="submit-btn">Generate Options</button>
            </div>
          </form>
          {multipleLoading && <div className="loading">Generating outfit options...</div>}
          {multipleResults && (
            <div className="results">
              {multipleResults.options && multipleResults.options.length === 0 ? (
                <p className="no-results">No outfit options found — add more items to your wardrobe</p>
              ) : (
                multipleResults.options && multipleResults.options.map((option, idx) => (
                  <OutfitResult
                    key={idx}
                    items={option.items}
                    outfit={option.outfit}
                    label={`Option ${idx + 1}${multipleOccasion ? ` — ${multipleOccasion}` : ''}`}
                  />
                ))
              )}
            </div>
          )}
        </section>

        {/* By Color Preference (PM-11) */}
        <section className="recommendation-section">
          <h2>By Color Preference</h2>
          <form className="weather-form" onSubmit={handleColorSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Enter a color (e.g. black, blue, red)"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="temp-input"
              />
              <button type="submit" className="submit-btn">Get Outfit</button>
            </div>
          </form>
          {colorLoading && <div className="loading">Finding outfits...</div>}
          {renderResults(colorResults, `Color: ${colorInput}`)}
        </section>

        {/* Must-Use Item (PM-12) */}
        <section className="recommendation-section">
          <h2>Build Around an Item</h2>
          <p className="section-description">Pick a specific item from your wardrobe and we'll build an outfit around it.</p>
          <form className="weather-form" onSubmit={handleMustUseSubmit}>
            <div className="form-row">
              <select
                value={mustUseItemId}
                onChange={(e) => setMustUseItemId(e.target.value)}
                className="condition-select"
              >
                <option value="">Select an item...</option>
                {wardrobeItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.category}{item.color ? `, ${item.color}` : ''})
                  </option>
                ))}
              </select>
              <button type="submit" className="submit-btn" disabled={!mustUseItemId}>Build Outfit</button>
            </div>
          </form>
          {mustUseLoading && <div className="loading">Building outfit...</div>}
          {mustUseResults && (
            <div className="results">
              <OutfitResult
                items={[mustUseResults.must_use_item, ...(mustUseResults.complementary_items || [])].filter(Boolean)}
                label={`Built around: ${mustUseResults.must_use_item?.name}`}
                outfit={mustUseResults.outfit}
              />
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default OutfitsPage;
