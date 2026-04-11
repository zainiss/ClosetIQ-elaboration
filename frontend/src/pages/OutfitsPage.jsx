import React, { useState, useEffect } from 'react';
import {
  getByOccasion, getByWeather, getByDressCode,
  getByColor, getWithItem, getMultipleOutfits, getWithShoes,
} from '../api/outfits';
import { getItems } from '../api/wardrobe';
import OutfitResult from '../components/outfits/OutfitResult';
import '../styles/outfits.css';

const SECTION_ICONS = {
  occasion:  '🎭',
  weather:   '🌤️',
  dressCode: '👔',
  shoes:     '👟',
  multiple:  '🔀',
  color:     '🎨',
  mustUse:   '⭐',
};

const LoadingDots = () => (
  <div className="loading-dots">
    <span /><span /><span />
  </div>
);

const OutfitsPage = () => {
  const [error, setError] = useState(null);

  const [selectedOccasion, setSelectedOccasion]   = useState(null);
  const [occasionResults, setOccasionResults]     = useState(null);
  const [occasionLoading, setOccasionLoading]     = useState(false);

  const [temperature, setTemperature]             = useState('');
  const [selectedWeather, setSelectedWeather]     = useState('');
  const [weatherResults, setWeatherResults]       = useState(null);
  const [weatherLoading, setWeatherLoading]       = useState(false);

  const [selectedDressCode, setSelectedDressCode] = useState(null);
  const [dressCodeResults, setDressCodeResults]   = useState(null);
  const [dressCodeLoading, setDressCodeLoading]   = useState(false);

  const [colorInput, setColorInput]               = useState('');
  const [colorResults, setColorResults]           = useState(null);
  const [colorLoading, setColorLoading]           = useState(false);

  const [shoesOccasion, setShoesOccasion]         = useState('');
  const [shoesResults, setShoesResults]           = useState(null);
  const [shoesLoading, setShoesLoading]           = useState(false);

  const [multipleOccasion, setMultipleOccasion]   = useState('');
  const [multipleResults, setMultipleResults]     = useState(null);
  const [multipleLoading, setMultipleLoading]     = useState(false);

  const [wardrobeItems, setWardrobeItems]         = useState([]);
  const [mustUseItemId, setMustUseItemId]         = useState('');
  const [mustUseResults, setMustUseResults]       = useState(null);
  const [mustUseLoading, setMustUseLoading]       = useState(false);

  const occasions       = ['Casual', 'Work', 'Wedding', 'Gym', 'Date Night'];
  const weatherConditions = ['Sunny', 'Rainy', 'Cold', 'Hot'];
  const dressCodes      = ['Formal', 'Semi-Formal', 'Business Casual', 'Smart Casual', 'Casual'];

  useEffect(() => { getItems().then(setWardrobeItems).catch(() => {}); }, []);

  const handleOccasionClick = async (occasion) => {
    if (selectedOccasion === occasion) { setSelectedOccasion(null); setOccasionResults(null); return; }
    setSelectedOccasion(occasion); setOccasionLoading(true); setError(null);
    try { setOccasionResults(await getByOccasion(occasion)); }
    catch (err) { setError(err.message); }
    finally { setOccasionLoading(false); }
  };

  const handleWeatherSubmit = async (e) => {
    e.preventDefault();
    if (!temperature && !selectedWeather) return;
    setWeatherLoading(true); setError(null);
    try {
      setWeatherResults(await getByWeather(
        temperature ? parseFloat(temperature) : undefined,
        selectedWeather || undefined,
      ));
    } catch (err) { setError(err.message); }
    finally { setWeatherLoading(false); }
  };

  const handleDressCodeClick = async (dressCode) => {
    if (selectedDressCode === dressCode) { setSelectedDressCode(null); setDressCodeResults(null); return; }
    setSelectedDressCode(dressCode); setDressCodeLoading(true); setError(null);
    try { setDressCodeResults(await getByDressCode(dressCode)); }
    catch (err) { setError(err.message); }
    finally { setDressCodeLoading(false); }
  };

  const handleShoesSubmit = async (e) => {
    e.preventDefault(); setShoesLoading(true); setError(null);
    try { setShoesResults(await getWithShoes(shoesOccasion || null)); }
    catch (err) { setError(err.message); }
    finally { setShoesLoading(false); }
  };

  const handleMultipleSubmit = async (e) => {
    e.preventDefault(); setMultipleLoading(true); setError(null);
    try { setMultipleResults(await getMultipleOutfits(multipleOccasion || null, 3)); }
    catch (err) { setError(err.message); }
    finally { setMultipleLoading(false); }
  };

  const handleColorSubmit = async (e) => {
    e.preventDefault();
    if (!colorInput.trim()) return;
    setColorLoading(true); setError(null);
    try { setColorResults(await getByColor(colorInput.trim())); }
    catch (err) { setError(err.message); }
    finally { setColorLoading(false); }
  };

  const handleMustUseSubmit = async (e) => {
    e.preventDefault();
    if (!mustUseItemId) return;
    setMustUseLoading(true); setError(null);
    try { setMustUseResults(await getWithItem(parseInt(mustUseItemId))); }
    catch (err) { setError(err.message); }
    finally { setMustUseLoading(false); }
  };

  const renderResults = (results, label) => {
    if (!results) return null;
    const items = Array.isArray(results) ? results : results.items || [];
    return (
      <div className="results animate-fadeInUp">
        {items.length === 0 ? (
          <p className="no-results">No items found for this selection</p>
        ) : (
          <OutfitResult items={items} label={label} outfit={results.outfit} />
        )}
      </div>
    );
  };

  return (
    <div className="outfits-page">
      <div className="outfits-header animate-fadeIn">
        <div className="outfits-header-inner">
          <div className="outfits-header-icon">{SECTION_ICONS.occasion}</div>
          <div>
            <h1>Outfit Recommendations</h1>
            <p>AI-powered suggestions tailored to your wardrobe</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message animate-fadeIn" style={{ maxWidth: 1200, margin: '0 auto 1rem', padding: '0 1rem' }}>
          {error}
        </div>
      )}

      <div className="recommendations-grid">

        {/* By Occasion */}
        <section className="recommendation-section animate-fadeInUp delay-1">
          <div className="section-header">
            <span className="section-icon">{SECTION_ICONS.occasion}</span>
            <h2>By Occasion</h2>
          </div>
          <div className="buttons-group">
            {occasions.map((occasion) => (
              <button
                key={occasion}
                className={`occasion-btn ${selectedOccasion === occasion ? 'active' : ''}`}
                onClick={() => handleOccasionClick(occasion)}
              >
                {occasion}
                {selectedOccasion === occasion && <span className="btn-check">✓</span>}
              </button>
            ))}
          </div>
          {occasionLoading && <LoadingDots />}
          {renderResults(occasionResults, `Occasion: ${selectedOccasion}`)}
        </section>

        {/* By Weather */}
        <section className="recommendation-section animate-fadeInUp delay-2">
          <div className="section-header">
            <span className="section-icon">{SECTION_ICONS.weather}</span>
            <h2>By Weather</h2>
          </div>
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
            </div>
            <button type="submit" className="submit-btn">Get Outfit</button>
          </form>
          {weatherLoading && <LoadingDots />}
          {renderResults(weatherResults, `Weather: ${selectedWeather || (temperature && temperature + '°C')}`)}
        </section>

        {/* By Dress Code */}
        <section className="recommendation-section animate-fadeInUp delay-3">
          <div className="section-header">
            <span className="section-icon">{SECTION_ICONS.dressCode}</span>
            <h2>By Dress Code</h2>
          </div>
          <div className="buttons-group">
            {dressCodes.map((code) => (
              <button
                key={code}
                className={`occasion-btn ${selectedDressCode === code ? 'active' : ''}`}
                onClick={() => handleDressCodeClick(code)}
              >
                {code}
                {selectedDressCode === code && <span className="btn-check">✓</span>}
              </button>
            ))}
          </div>
          {dressCodeLoading && <LoadingDots />}
          {renderResults(dressCodeResults, `Dress Code: ${selectedDressCode}`)}
        </section>

        {/* Complete Look with Shoes */}
        <section className="recommendation-section animate-fadeInUp delay-4">
          <div className="section-header">
            <span className="section-icon">{SECTION_ICONS.shoes}</span>
            <h2>Complete Look with Shoes</h2>
          </div>
          <p className="section-description">Get a full outfit recommendation that always includes footwear.</p>
          <form className="weather-form" onSubmit={handleShoesSubmit}>
            <input
              type="text"
              placeholder="Occasion (optional)"
              value={shoesOccasion}
              onChange={(e) => setShoesOccasion(e.target.value)}
              className="temp-input"
            />
            <button type="submit" className="submit-btn">Get Complete Look</button>
          </form>
          {shoesLoading && <LoadingDots />}
          {shoesResults && (
            <div className="results animate-fadeInUp">
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

        {/* Multiple Outfit Options */}
        <section className="recommendation-section animate-fadeInUp delay-5">
          <div className="section-header">
            <span className="section-icon">{SECTION_ICONS.multiple}</span>
            <h2>Multiple Outfit Options</h2>
          </div>
          <p className="section-description">Generate 3 different outfit combinations to choose from.</p>
          <form className="weather-form" onSubmit={handleMultipleSubmit}>
            <input
              type="text"
              placeholder="Occasion (optional)"
              value={multipleOccasion}
              onChange={(e) => setMultipleOccasion(e.target.value)}
              className="temp-input"
            />
            <button type="submit" className="submit-btn">Generate Options</button>
          </form>
          {multipleLoading && <LoadingDots />}
          {multipleResults && (
            <div className="results">
              {multipleResults.options?.length === 0 ? (
                <p className="no-results">No options found — add more items to your wardrobe</p>
              ) : (
                multipleResults.options?.map((option, idx) => (
                  <div key={idx} className="animate-fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <OutfitResult
                      items={option.items}
                      outfit={option.outfit}
                      label={`Option ${idx + 1}${multipleOccasion ? ` — ${multipleOccasion}` : ''}`}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* By Color */}
        <section className="recommendation-section animate-fadeInUp delay-6">
          <div className="section-header">
            <span className="section-icon">{SECTION_ICONS.color}</span>
            <h2>By Color Preference</h2>
          </div>
          <form className="weather-form" onSubmit={handleColorSubmit}>
            <input
              type="text"
              placeholder="e.g. black, navy blue, emerald"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="temp-input"
            />
            <button type="submit" className="submit-btn">Get Outfit</button>
          </form>
          {colorLoading && <LoadingDots />}
          {renderResults(colorResults, `Color: ${colorInput}`)}
        </section>

        {/* Build Around an Item */}
        <section className="recommendation-section animate-fadeInUp">
          <div className="section-header">
            <span className="section-icon">{SECTION_ICONS.mustUse}</span>
            <h2>Build Around an Item</h2>
          </div>
          <p className="section-description">Pick a specific item from your wardrobe and we'll build an outfit around it.</p>
          <form className="weather-form" onSubmit={handleMustUseSubmit}>
            <select
              value={mustUseItemId}
              onChange={(e) => setMustUseItemId(e.target.value)}
              className="condition-select"
            >
              <option value="">Select an item…</option>
              {wardrobeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category}{item.color ? `, ${item.color}` : ''})
                </option>
              ))}
            </select>
            <button type="submit" className="submit-btn" disabled={!mustUseItemId}>
              Build Outfit
            </button>
          </form>
          {mustUseLoading && <LoadingDots />}
          {mustUseResults && (
            <div className="results animate-fadeInUp">
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
