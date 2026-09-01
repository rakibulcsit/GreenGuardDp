// State management
const DEFAULT_LOCATION = {
    name: "Dhaka, Bangladesh",
    lat: 23.7104,
    lon: 90.4074
};

function getSavedLocation() {
    try {
        const stored = localStorage.getItem('greenguard_location');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error reading location from localStorage", e);
    }
    return DEFAULT_LOCATION;
}

function saveLocation(name, lat, lon) {
    const loc = { name, lat: parseFloat(lat), lon: parseFloat(lon) };
    localStorage.setItem('greenguard_location', JSON.stringify(loc));
    // Dispatch a custom event to notify components if loaded in the same page
    window.dispatchEvent(new CustomEvent('greenguardLocationChanged', { detail: loc }));
}

// Weather WMO code mapping
const WMO_CODES = {
    0: { desc: "Sunny and Clear", icon: "☀️" },
    1: { desc: "Mainly Clear", icon: "☀️" },
    2: { desc: "Partly Cloudy", icon: "⛅" },
    3: { desc: "Overcast", icon: "☁️" },
    45: { desc: "Foggy", icon: "🌫️" },
    48: { desc: "Depositing Rime Fog", icon: "🌫️" },
    51: { desc: "Light Drizzle", icon: "🌧️" },
    53: { desc: "Moderate Drizzle", icon: "🌧️" },
    55: { desc: "Dense Drizzle", icon: "🌧️" },
    56: { desc: "Light Freezing Drizzle", icon: "🌧️" },
    57: { desc: "Dense Freezing Drizzle", icon: "🌧️" },
    61: { desc: "Slight Rain", icon: "🌧️" },
    63: { desc: "Moderate Rain", icon: "🌧️" },
    65: { desc: "Heavy Rain", icon: "🌧️" },
    66: { desc: "Light Freezing Rain", icon: "🌧️" },
    67: { desc: "Heavy Freezing Rain", icon: "🌧️" },
    71: { desc: "Slight Snow Fall", icon: "🌨️" },
    73: { desc: "Moderate Snow Fall", icon: "🌨️" },
    75: { desc: "Heavy Snow Fall", icon: "🌨️" },
    77: { desc: "Snow Grains", icon: "🌨️" },
    80: { desc: "Slight Rain Showers", icon: "🌧️" },
    81: { desc: "Moderate Rain Showers", icon: "🌧️" },
    82: { desc: "Violent Rain Showers", icon: "🌧️" },
    85: { desc: "Slight Snow Showers", icon: "🌨️" },
    86: { desc: "Heavy Snow Showers", icon: "🌨️" },
    95: { desc: "Thunderstorm", icon: "⛈️" },
    96: { desc: "Thunderstorm with Hail", icon: "⛈️" },
    99: { desc: "Thunderstorm with Heavy Hail", icon: "⛈️" }
};

function getWeatherDetails(code) {
    return WMO_CODES[code] || { desc: "Partly Cloudy", icon: "☁️" };
}

function getWeatherIconClass(code) {
    if (code === 0 || code === 1) return { class: "fa-solid fa-sun", color: "#f1c40f" };
    if (code === 2) return { class: "fa-solid fa-cloud-sun", color: "#f39c12" };
    if (code === 3) return { class: "fa-solid fa-cloud", color: "#7f8c8d" };
    if (code === 45 || code === 48) return { class: "fa-solid fa-smog", color: "#bdc3c7" };
    if (code >= 51 && code <= 57) return { class: "fa-solid fa-cloud-rain", color: "#3498db" };
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { class: "fa-solid fa-cloud-showers-heavy", color: "#2980b9" };
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { class: "fa-solid fa-snowflake", color: "#a5f3fc" };
    if (code === 95 || code === 96 || code === 99) return { class: "fa-solid fa-cloud-bolt", color: "#e74c3c" };
    return { class: "fa-solid fa-cloud", color: "#7f8c8d" };
}

// APIs
async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,pressure_msl,wind_speed_10m,visibility,cloud_cover&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch weather data");
    return response.json();
}

async function fetchAirQualityData(lat, lon) {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide&hourly=us_aqi,pm2_5,pm10&forecast_days=7&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch air quality data");
    return response.json();
}

async function searchCity(query) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Geocoding search failed");
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
}

async function getCityFromCoords(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
        const response = await fetch(url, {
            headers: {
                "Accept-Language": "en"
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || "Unknown Location";
                const country = data.address.country || "";
                return country ? `${city}, ${country}` : city;
            }
        }
    } catch (e) {
        console.error("Nominatim reverse geocoding failed, falling back", e);
    }
    return `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
}

// Activity Logging (to prevent repeat in every script)
function logActivity(type, title, desc) {
    let history = JSON.parse(localStorage.getItem('greenguard_history') || '[]');
    history.unshift({
        type: type,
        title: title,
        desc: desc,
        timestamp: new Date().toISOString()
    });
    if (history.length > 50) history.pop();
    localStorage.setItem('greenguard_history', JSON.stringify(history));
}

// Shared UI Handlers
function setupSharedUIHandlers(onUpdateCallback) {
    const searchBtn = document.querySelector('.search-btn');
    const cityInput = document.getElementById('city-input');
    const locationBtn = document.querySelector('.location-btn');

    const handleSearch = async () => {
        const query = cityInput ? cityInput.value.trim() : "";
        if (!query) {
            alert('Please enter a city name.');
            return;
        }

        try {
            // Show searching feedback if input is present
            if (cityInput) cityInput.disabled = true;
            if (searchBtn) searchBtn.disabled = true;

            const result = await searchCity(query);
            if (result) {
                const name = `${result.name}, ${result.country}`;
                saveLocation(name, result.latitude, result.longitude);
                logActivity('search', 'City Search Query', `Searched environmental metrics for ${name}`);
                
                if (onUpdateCallback) {
                    onUpdateCallback(result.latitude, result.longitude, name);
                } else if (window.loadEnvironmentalData) {
                    window.loadEnvironmentalData(result.latitude, result.longitude, name);
                } else {
                    window.location.reload();
                }
            } else {
                alert(`City "${query}" not found. Please try another name.`);
            }
        } catch (e) {
            console.error("Search error", e);
            alert("Error searching city. Please try again later.");
        } finally {
            if (cityInput) cityInput.disabled = false;
            if (searchBtn) searchBtn.disabled = false;
        }
    };

    if (searchBtn) {
        searchBtn.onclick = handleSearch;
    }
    if (cityInput) {
        cityInput.onkeypress = (e) => {
            if (e.key === 'Enter') handleSearch();
        };
    }

    if (locationBtn) {
        locationBtn.onclick = () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            locationBtn.disabled = true;
            const originalHTML = locationBtn.innerHTML;
            locationBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;

            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const cityName = await getCityFromCoords(lat, lon);
                    saveLocation(cityName, lat, lon);
                    logActivity('location', 'Location Requested', `Located device at ${cityName}`);
                    
                    if (onUpdateCallback) {
                        onUpdateCallback(lat, lon, cityName);
                    } else if (window.loadEnvironmentalData) {
                        window.loadEnvironmentalData(lat, lon, cityName);
                    } else {
                        window.location.reload();
                    }
                } catch (e) {
                    console.error(e);
                    // fallback
                    const cityName = `My Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
                    saveLocation(cityName, lat, lon);
                    
                    if (onUpdateCallback) {
                        onUpdateCallback(lat, lon, cityName);
                    } else if (window.loadEnvironmentalData) {
                        window.loadEnvironmentalData(lat, lon, cityName);
                    } else {
                        window.location.reload();
                    }
                } finally {
                    locationBtn.disabled = false;
                    locationBtn.innerHTML = originalHTML;
                }
            }, (error) => {
                console.error(error);
                alert("Error getting location: " + error.message);
                locationBtn.disabled = false;
                locationBtn.innerHTML = originalHTML;
            }, { timeout: 10000 });
        };
    }
}
