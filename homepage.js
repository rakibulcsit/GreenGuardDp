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

// Update the weather UI details from API
function updateWeatherUI(data) {
    const curr = data.current;
    if (!curr) return;

    const tempEl = document.getElementById('weather-temp');
    const feelsEl = document.getElementById('weather-feels-like');
    const statusDescEl = document.getElementById('weather-status-desc');
    const humidityEl = document.getElementById('weather-humidity');
    const windEl = document.getElementById('weather-wind');
    const visibilityEl = document.getElementById('weather-visibility');
    
    if (tempEl) tempEl.innerText = `${Math.round(curr.temperature_2m)}°c`;
    if (feelsEl) feelsEl.innerText = `Feels like ${Math.round(curr.apparent_temperature)}°C`;
    
    const weatherDetails = getWeatherDetails(curr.weather_code);
    if (statusDescEl) statusDescEl.innerText = weatherDetails.desc;
    
    // Update the weather icon using FontAwesome mapping
    const iconEl = document.getElementById('weather-status-icon');
    if (iconEl) {
        const iconInfo = getWeatherIconClass(curr.weather_code);
        iconEl.className = iconInfo.class;
        iconEl.style.color = iconInfo.color;
        iconEl.style.fontSize = "3rem";
    }

    if (humidityEl) humidityEl.innerText = `${curr.relative_humidity_2m}%`;
    if (windEl) windEl.innerText = `${curr.wind_speed_10m} km/h`;
    if (visibilityEl) visibilityEl.innerText = `${(curr.visibility / 1000).toFixed(1)} km`;
}

// Update the AQI circle gauge and values from API
function updateAqiUI(data) {
    const curr = data.current;
    if (!curr) return;

    const valEl = document.getElementById('homepage-aqi-val');
    const fillCircle = document.getElementById('homepage-aqi-fill');
    const descEl = document.getElementById('homepage-aqi-desc');
    const pollutantsEl = document.getElementById('homepage-aqi-pollutants');

    const aqi = Math.round(curr.us_aqi);
    if (valEl) valEl.innerText = aqi;

    // Circle gauge properties
    const RADIUS = 50;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    if (fillCircle) {
        const clampedAqi = Math.max(0, Math.min(500, aqi));
        const percentage = clampedAqi / 500;
        const strokeOffset = CIRCUMFERENCE - (percentage * CIRCUMFERENCE);
        
        fillCircle.style.strokeDasharray = `${CIRCUMFERENCE}`;
        fillCircle.style.strokeDashoffset = strokeOffset;

        // Change color based on AQI
        if (aqi <= 50) fillCircle.style.stroke = "#2ecc71";
        else if (aqi <= 100) fillCircle.style.stroke = "#f1c40f";
        else if (aqi <= 150) fillCircle.style.stroke = "#e67e22";
        else fillCircle.style.stroke = "#e74c3c";
    }

    // Set descriptive text and pollutants summary
    let statusText = "Good";
    let statusSummary = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
    if (aqi > 150) {
        statusText = "Unhealthy";
        statusSummary = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
    } else if (aqi > 100) {
        statusText = "Poor";
        statusSummary = "Air quality is unhealthy for sensitive groups. Members of sensitive groups may experience health effects.";
    } else if (aqi > 50) {
        statusText = "Moderate";
        statusSummary = "Air quality is acceptable; however, there may be a moderate concern for some people sensitive to air pollution.";
    }

    if (descEl) descEl.innerText = statusText;
    if (pollutantsEl) {
        pollutantsEl.innerHTML = `${statusSummary}<br><small style="color:var(--text-muted)">Pollutants: PM2.5: ${curr.pm2_5.toFixed(1)} | PM10: ${curr.pm10.toFixed(1)} | O₃: ${curr.ozone.toFixed(1)}</small>`;
    }
}

// Update safety warnings dynamically depending on weather conditions
function updateAlertsUI(weatherData, aqiData, cityName) {
    const alertsContainer = document.getElementById('homepage-alerts-container');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = "";
    const wCurrent = weatherData.current;
    const aCurrent = aqiData.current;
    
    const alerts = [];

    // Check AQI Alert
    if (aCurrent.us_aqi > 150) {
        alerts.push({
            severity: "danger",
            icon: "fa-solid fa-circle-exclamation",
            title: "Critical Air Quality Alert",
            desc: `AQI index is ${Math.round(aCurrent.us_aqi)} in ${cityName}. Elevated fine particulate levels represent health risks. Wear a mask outdoors.`
        });
    } else if (aCurrent.us_aqi > 100) {
        alerts.push({
            severity: "warning",
            icon: "fa-solid fa-triangle-exclamation",
            title: "Poor Air Quality Alert",
            desc: `AQI index is ${Math.round(aCurrent.us_aqi)} in ${cityName}. Sensitive individuals should restrict heavy outdoor exertion.`
        });
    }

    // Check Temperature Alert
    if (wCurrent.temperature_2m > 35) {
        alerts.push({
            severity: "danger",
            icon: "fa-solid fa-temperature-high",
            title: "Extreme Temperature Alert",
            desc: `Current temp is ${Math.round(wCurrent.temperature_2m)}°C (Feels like ${Math.round(wCurrent.apparent_temperature)}°C). High risk of heat exhaustion. Stay hydrated.`
        });
    } else if (wCurrent.temperature_2m > 30) {
        alerts.push({
            severity: "warning",
            icon: "fa-solid fa-temperature-high",
            title: "Warm Temperature Warning",
            desc: `Current temp is ${Math.round(wCurrent.temperature_2m)}°C. Carry drinking water and limit prolonged solar exposure.`
        });
    } else if (wCurrent.temperature_2m < 15) {
        alerts.push({
            severity: "info",
            icon: "fa-solid fa-temperature-low",
            title: "Cold Temperature Info",
            desc: `Current temperature is ${Math.round(wCurrent.temperature_2m)}°C. Bundle up when going outdoors.`
        });
    }

    // Check Rain/Storm
    if (wCurrent.rain > 1) {
        alerts.push({
            severity: "warning",
            icon: "fa-solid fa-cloud-showers-heavy",
            title: "Active Rain Precipitations",
            desc: "Measurable rainfall detected. Wet roads and limited visibility possible. Carry an umbrella."
        });
    } else if (wCurrent.precipitation > 0) {
        alerts.push({
            severity: "info",
            icon: "fa-solid fa-cloud-sun-rain",
            title: "Light Rain Warning",
            desc: "Light showers detected. Keep an umbrella handy."
        });
    }

    // Check Wind Speed
    if (wCurrent.wind_speed_10m > 25) {
        alerts.push({
            severity: "warning",
            icon: "fa-solid fa-wind",
            title: "High Wind Speed Alert",
            desc: `Wind is blowing at ${wCurrent.wind_speed_10m} km/h. Secure loose outdoor objects.`
        });
    }

    // If no alerts, show normal status info alert
    if (alerts.length === 0) {
        alerts.push({
            severity: "info",
            icon: "fa-solid fa-circle-check",
            title: "All Parameters Safe",
            desc: "No active hazard alerts. Weather, temperatures, and AQI indices are currently within safe guidelines."
        });
    }

    // Render alerts
    alerts.forEach(alert => {
        const alertHtml = `
            <div class="alert-item ${alert.severity}">
                <i class="${alert.icon}"></i>
                <div class="alert-text">
                    <h4>${alert.title}</h4>
                    <p>${alert.desc}</p>
                </div>
                <i class="fa-solid fa-chevron-right arrow-right"></i>
            </div>
        `;
        alertsContainer.insertAdjacentHTML('beforeend', alertHtml);
    });
}

// Main load routine
window.loadEnvironmentalData = function(lat, lon, cityName) {
    const locText = document.getElementById('location-text');
    if (locText) {
        locText.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cityName}`;
    }
    
    // Fetch and display
    Promise.all([
        fetchWeatherData(lat, lon),
        fetchAirQualityData(lat, lon)
    ]).then(([wData, aData]) => {
        updateWeatherUI(wData);
        updateAqiUI(aData);
        updateAlertsUI(wData, aData, cityName);
    }).catch(err => {
        console.error("Failed loading data", err);
    });
};

// Initial run
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 60000);

    const saved = getSavedLocation();
    window.loadEnvironmentalData(saved.lat, saved.lon, saved.name);

    // Wire search input and use-my-location button
    setupSharedUIHandlers(window.loadEnvironmentalData);
});