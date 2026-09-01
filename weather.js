// Execution routine to format and refresh the live timestamp
function updateDateTime() {
    const now = new Date();
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;
    
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        timeEl.innerText = `${dateStr} | ${timeStr}`;
    }
}

function getUvLevelText(val) {
    if (val <= 2) return `<i class="fa-solid fa-circle" style="color:#2ecc71"></i> Low (${val.toFixed(1)})`;
    if (val <= 5) return `<i class="fa-solid fa-circle" style="color:#f1c40f"></i> Moderate (${val.toFixed(1)})`;
    if (val <= 7) return `<i class="fa-solid fa-circle" style="color:#e67e22"></i> High (${val.toFixed(1)})`;
    if (val <= 10) return `<i class="fa-solid fa-circle" style="color:#e74c3c"></i> Very High (${val.toFixed(1)})`;
    return `<i class="fa-solid fa-circle" style="color:#9b59b6"></i> Extreme (${val.toFixed(1)})`;
}

function updateWeatherUI(data, cityName) {
    const curr = data.current;
    if (!curr) return;

    // Update basic fields
    const cityEl = document.getElementById('weather-city');
    const tempEl = document.getElementById('weather-temp-val');
    const statusEl = document.getElementById('weather-status-val');
    const iconEl = document.getElementById('weather-icon-el');

    if (cityEl) cityEl.innerText = cityName;
    if (tempEl) tempEl.innerText = `${Math.round(curr.temperature_2m)}°c`;

    const weatherDetails = getWeatherDetails(curr.weather_code);
    if (statusEl) statusEl.innerText = weatherDetails.desc;
    if (iconEl) {
        iconEl.innerText = weatherDetails.icon;
        iconEl.style.fontSize = "4.5rem";
    }

    // Stats-list
    const feelsEl = document.getElementById('weather-feels-val');
    const humidityEl = document.getElementById('weather-humidity-val');
    const windEl = document.getElementById('weather-wind-val');
    const pressureEl = document.getElementById('weather-pressure-val');
    const visibilityEl = document.getElementById('weather-visibility-val');
    const cloudEl = document.getElementById('weather-cloud-val');

    if (feelsEl) feelsEl.innerText = `${Math.round(curr.apparent_temperature)}°c`;
    if (humidityEl) humidityEl.innerText = `${curr.relative_humidity_2m}%`;
    if (windEl) windEl.innerText = `${curr.wind_speed_10m} km/h`;
    if (pressureEl) pressureEl.innerText = `${Math.round(curr.pressure_msl)} hPa`;
    if (visibilityEl) visibilityEl.innerText = `${(curr.visibility / 1000).toFixed(1)} km`;
    if (cloudEl) cloudEl.innerText = `${curr.cloud_cover}%`;

    // Hourly Forecast
    updateHourlyForecast(data.hourly);

    // Sunrise, Sunset, UV Index
    updateAdditionalInfo(data.daily);
}

function updateHourlyForecast(hourly) {
    const container = document.getElementById('hourly-cards-container');
    if (!container || !hourly) return;

    container.innerHTML = "";

    const now = new Date();
    const nowIsoHour = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`;
    let startIndex = hourly.time.indexOf(nowIsoHour);
    if (startIndex === -1) {
        startIndex = now.getHours();
    }

    // Render next 7 hours
    for (let i = startIndex; i < startIndex + 7 && i < hourly.time.length; i++) {
        const temp = Math.round(hourly.temperature_2m[i]);
        const wCode = hourly.weather_code[i];
        const wDetails = getWeatherDetails(wCode);
        
        let label = "Now";
        if (i > startIndex) {
            const hourVal = parseInt(hourly.time[i].substring(11, 13));
            label = hourVal === 0 ? "12 AM" : hourVal === 12 ? "12 PM" : hourVal > 12 ? (hourVal - 12) + " PM" : hourVal + " AM";
        }

        const cardHtml = `
            <div class="card">
                <span>${label}</span>
                <div class="icon" style="font-size: 1.5rem; margin: 8px 0;">${wDetails.icon}</div>
                <strong>${temp}°C</strong>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    }
}

function updateAdditionalInfo(daily) {
    if (!daily) return;

    const sunriseEl = document.getElementById('sunrise-val');
    const sunsetEl = document.getElementById('sunset-val');
    const uvEl = document.getElementById('uv-val');

    const formatTimeOnly = (isoStr) => {
        if (!isoStr) return "";
        const date = new Date(isoStr);
        let hours = date.getHours();
        const minutes = isNaN(hours) ? isoStr.substring(11, 16) : String(date.getMinutes()).padStart(2, '0');
        if (isNaN(hours)) {
            const h = parseInt(isoStr.substring(11, 13));
            const m = isoStr.substring(14, 16);
            const ampm = h >= 12 ? "PM" : "AM";
            const h12 = h % 12 || 12;
            return `${h12}:${m} ${ampm}`;
        }
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    if (sunriseEl && daily.sunrise && daily.sunrise[0]) {
        sunriseEl.innerHTML = `<i class="fa-solid fa-sun text-yellow"></i> ${formatTimeOnly(daily.sunrise[0])}`;
    }
    if (sunsetEl && daily.sunset && daily.sunset[0]) {
        sunsetEl.innerHTML = `<i class="fa-solid fa-moon text-orange"></i> ${formatTimeOnly(daily.sunset[0])}`;
    }
    if (uvEl && daily.uv_index_max && daily.uv_index_max[0] !== undefined) {
        uvEl.innerHTML = getUvLevelText(daily.uv_index_max[0]);
    }
}

window.loadEnvironmentalData = function(lat, lon, cityName) {
    fetchWeatherData(lat, lon).then(data => {
        updateWeatherUI(data, cityName);
    }).catch(err => {
        console.error("Failed loading weather data", err);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 60000);

    const saved = getSavedLocation();
    window.loadEnvironmentalData(saved.lat, saved.lon, saved.name);

    setupSharedUIHandlers(window.loadEnvironmentalData);
});
