# Weather API Integration Research (PM-45)

## Research Question

Which weather API should ClosetIQ use to fetch real-time weather data for outfit recommendations?

---

## APIs Evaluated

### 1. OpenWeatherMap (openweathermap.org)
- **Free tier:** 1,000 calls/day, current weather + 5-day forecast
- **Endpoint:** `GET api.openweathermap.org/data/2.5/weather?q={city}&appid={key}`
- **Response includes:** temp (Kelvin, convert to °C), weather condition string, humidity, wind
- **Pros:** Most widely used, good docs, reliable, free tier covers our use case
- **Cons:** Requires user to provide city name or coordinates

### 2. WeatherAPI (weatherapi.com)
- **Free tier:** 1 million calls/month
- **Endpoint:** `GET api.weatherapi.com/v1/current.json?key={key}&q={location}`
- **Response includes:** temp_c, condition.text, humidity, wind_kph, feelslike_c
- **Pros:** Higher free tier limit, cleaner JSON, includes "feels like" temp
- **Cons:** Less established than OpenWeatherMap

### 3. Open-Meteo (open-meteo.com)
- **Free tier:** Unlimited (open source, no API key required)
- **Endpoint:** `GET api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true`
- **Response includes:** temperature, windspeed, weathercode (WMO standard)
- **Pros:** No API key, no rate limit, privacy-friendly
- **Cons:** Requires coordinates (not city name), WMO weather codes need mapping table

---

## Recommendation

**Open-Meteo** for the backend weather fetch — no API key means no setup friction for graders or new developers cloning the repo. Coordinates can be obtained from browser Geolocation API on the frontend.

### Implementation Plan

Frontend sends coordinates to backend → backend calls Open-Meteo → maps WMO code to condition string → passes to `recommend_by_weather` service.

**WMO Code → Condition Mapping:**

```python
WMO_TO_CONDITION = {
    0: 'Sunny',   # Clear sky
    1: 'Sunny',   2: 'Sunny',   3: 'Cloudy',
    45: 'Cloudy', 48: 'Cloudy',
    51: 'Rainy',  53: 'Rainy',  55: 'Rainy',
    61: 'Rainy',  63: 'Rainy',  65: 'Rainy',
    71: 'Cold',   73: 'Cold',   75: 'Cold',
    77: 'Cold',
    80: 'Rainy',  81: 'Rainy',  82: 'Rainy',
    95: 'Rainy',  96: 'Rainy',  99: 'Rainy',
}
```

**Example fetch (Python):**
```python
import requests

def get_current_weather(latitude, longitude):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        f"&current_weather=true"
    )
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    data = resp.json()['current_weather']
    condition = WMO_TO_CONDITION.get(data['weathercode'], 'Sunny')
    return {
        'temperature': data['temperature'],  # already in °C
        'condition': condition
    }
```

> **Note:** Live weather integration is out of scope for this iteration. The `/outfits/by-weather` endpoint currently accepts manual temperature/condition input. This research documents the planned integration path.
