// State variables
let currentMode = "weather"; // "weather" or "aqi"
let selectedDayIndex = 0;

let weatherForecastData = [];
let aqiForecastData = [];

// Helper function to get UV index description text
function getUvText(val) {
    if (val <= 2) return `Low (${val.toFixed(0)})`;
    if (val <= 5) return `Moderate (${val.toFixed(0)})`;
    if (val <= 7) return `High (${val.toFixed(0)})`;
    if (val <= 10) return `Very High (${val.toFixed(0)})`;
    return `Extreme (${val.toFixed(0)})`;
}

function getAqiColor(aqi) {
    if (aqi <= 50) return "#2ecc71"; // good
    if (aqi <= 100) return "#f1c40f"; // moderate
    if (aqi <= 150) return "#e67e22"; // poor
    return "#e74c3c"; // unhealthy
}

// Render the 7-day forecast list depending on the selected mode
function renderForecastList() {
    const container = document.getElementById('days-container');
    if (!container) return;

    container.innerHTML = "";

    const data = currentMode === "weather" ? weatherForecastData : aqiForecastData;

    if (!data || data.length === 0) {
        container.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">Loading forecast data...</p>`;
        return;
    }

    data.forEach((item, index) => {
        const isActive = index === selectedDayIndex ? "active" : "";
        let rowHtml = "";

        if (currentMode === "weather") {
            rowHtml = `
                <div class="day-row-item ${isActive}" onclick="selectDay(${index})">
                    <span class="day-name">${item.day}</span>
                    <span class="day-icon">${item.icon}</span>
                    <span class="day-temp">${item.high}°C<span class="low">${item.low}°C</span></span>
                    <span class="day-precip"><i class="fa-solid fa-umbrella"></i> ${item.precip}</span>
                    <span class="day-humidity"><i class="fa-solid fa-droplet"></i> ${item.humidity}</span>
                </div>
            `;
        } else {
            // AQI layout
            rowHtml = `
                <div class="day-row-item ${isActive}" onclick="selectDay(${index})">
                    <span class="day-name">${item.day}</span>
                    <span class="day-icon">${item.icon}</span>
                    <span class="day-temp" style="color: ${getAqiColor(item.aqi)}">${item.aqi} AQI</span>
                    <span class="day-precip" style="grid-column: span 2; font-weight: 500; color: ${getAqiColor(item.aqi)}">
                        <i class="fa-solid fa-circle"></i> ${item.status}
                    </span>
                </div>
            `;
        }

        container.insertAdjacentHTML('beforeend', rowHtml);
    });
}

// Function to select and display the daily details
function selectDay(index) {
    selectedDayIndex = index;
    
    // Refresh rows active status
    const rows = document.querySelectorAll('.day-row-item');
    rows.forEach((row, i) => {
        if (i === index) row.classList.add('active');
        else row.classList.remove('active');
    });

    const heroIcon = document.getElementById('detail-hero-icon');
    const heroVal = document.getElementById('detail-hero-val');
    const heroDesc = document.getElementById('detail-hero-desc');
    const metricsContainer = document.getElementById('detail-metrics');

    if (currentMode === "weather") {
        const item = weatherForecastData[index];
        if (!item) return;

        if (heroIcon) heroIcon.innerText = item.icon;
        if (heroVal) heroVal.innerText = `${item.high}°C`;
        if (heroDesc) heroDesc.innerText = item.status;

        if (metricsContainer) {
            metricsContainer.innerHTML = `
                <div class="metric-row">
                    <span><i class="fa-solid fa-temperature-half"></i> Temp Range</span>
                    <strong>${item.low}°C - ${item.high}°C</strong>
                </div>
                <div class="metric-row">
                    <span><i class="fa-solid fa-cloud-showers-heavy"></i> Rain Probability</span>
                    <strong>${item.precip}</strong>
                </div>
                <div class="metric-row">
                    <span><i class="fa-solid fa-droplet"></i> Avg Humidity</span>
                    <strong>${item.humidity}</strong>
                </div>
                <div class="metric-row">
                    <span><i class="fa-solid fa-wind"></i> Wind Speed</span>
                    <strong>${item.wind}</strong>
                </div>
                <div class="metric-row">
                    <span><i class="fa-solid fa-sun"></i> UV Index</span>
                    <strong>${item.uv}</strong>
                </div>
            `;
        }
    } else {
        const item = aqiForecastData[index];
        if (!item) return;

        if (heroIcon) heroIcon.innerText = item.icon;
        if (heroVal) {
            heroVal.innerText = item.aqi;
            heroVal.style.color = getAqiColor(item.aqi);
        }
        if (heroDesc) heroDesc.innerText = item.status;

        if (metricsContainer) {
            metricsContainer.innerHTML = `
                <div class="metric-row">
                    <span><i class="fa-solid fa-lungs"></i> PM2.5 Level</span>
                    <strong>${item.pm25} µg/m³</strong>
                </div>
                <div class="metric-row">
                    <span><i class="fa-solid fa-smog"></i> PM10 Level</span>
                    <strong>${item.pm10} µg/m³</strong>
                </div>
                <div class="metric-row">
                    <span><i class="fa-solid fa-flask"></i> Primary Pollutant</span>
                    <strong>${item.pollutant}</strong>
                </div>
                <div class="metric-row">
                    <span><i class="fa-solid fa-triangle-exclamation"></i> Health Risk</span>
                    <strong>${item.risk}</strong>
                </div>
            `;
        }
    }
}

// Aggregate hourly AQI forecast into daily outlooks
function aggregateHourlyToDaily(hourlyData) {
    const daily = [];
    const times = hourlyData.time;
    const usAqi = hourlyData.us_aqi;
    const pm25 = hourlyData.pm2_5;
    const pm10 = hourlyData.pm10;

    const groups = {};
    for (let i = 0; i < times.length; i++) {
        const dateStr = times[i].substring(0, 10);
        if (!groups[dateStr]) {
            groups[dateStr] = {
                aqis: [],
                pm25s: [],
                pm10s: []
            };
        }
        if (usAqi[i] !== null && usAqi[i] !== undefined) groups[dateStr].aqis.push(usAqi[i]);
        if (pm25[i] !== null && pm25[i] !== undefined) groups[dateStr].pm25s.push(pm25[i]);
        if (pm10[i] !== null && pm10[i] !== undefined) groups[dateStr].pm10s.push(pm10[i]);
    }

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    Object.keys(groups).forEach((dateStr, idx) => {
        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay();
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        let dayName = weekdays[dayOfWeek];
        if (dateStr === todayStr) {
            dayName = "Today";
        }

        const aqis = groups[dateStr].aqis;
        const pm25s = groups[dateStr].pm25s;
        const pm10s = groups[dateStr].pm10s;

        const maxAqi = aqis.length ? Math.max(...aqis) : 0;
        const avgPm25 = pm25s.length ? (pm25s.reduce((a, b) => a + b, 0) / pm25s.length).toFixed(1) : "0.0";
        const avgPm10 = pm10s.length ? (pm10s.reduce((a, b) => a + b, 0) / pm10s.length).toFixed(1) : "0.0";

        let status = "Good";
        let icon = "🍃";
        let risk = "Minimal / No Risk";
        let pollutant = "None";

        if (maxAqi > 150) {
            status = "Unhealthy";
            icon = "🚨";
            risk = "General Population Risk";
            pollutant = "PM2.5";
        } else if (maxAqi > 100) {
            status = "Poor";
            icon = "😷";
            risk = "Sensitive Groups Risk";
            pollutant = "PM2.5";
        } else if (maxAqi > 50) {
            status = "Moderate";
            icon = "😐";
            risk = "Acceptable / Slight Risk";
            pollutant = "PM10";
        }

        daily.push({
            day: dayName,
            date: dateStr,
            aqi: Math.round(maxAqi),
            status: status,
            icon: icon,
            risk: risk,
            pollutant: pollutant,
            pm25: avgPm25,
            pm10: avgPm10
        });
    });

    return daily;
}

// Fetch forecast data and build lists
window.loadEnvironmentalData = function(lat, lon, cityName) {
    const forecastLoader = document.getElementById('days-container');
    if (forecastLoader) {
        forecastLoader.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">Fetching forecast data...</p>`;
    }

    Promise.all([
        fetchWeatherData(lat, lon),
        fetchAirQualityData(lat, lon)
    ]).then(([wData, aData]) => {
        // Map Weather Daily Data
        weatherForecastData = [];
        const wDaily = wData.daily;
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        for (let i = 0; i < wDaily.time.length; i++) {
            const dateStr = wDaily.time[i];
            const dateObj = new Date(dateStr);
            let dayName = weekdays[dateObj.getDay()];
            
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            if (dateStr === todayStr) {
                dayName = "Today";
            }

            const wCode = wDaily.weather_code[i];
            const wDetails = getWeatherDetails(wCode);

            const precipProb = wDaily.precipitation_probability_max[i] || 0;
            const humidityVal = Math.round(55 + (precipProb * 0.35)) + "%";

            weatherForecastData.push({
                day: dayName,
                date: dateStr,
                icon: wDetails.icon,
                high: Math.round(wDaily.temperature_2m_max[i]),
                low: Math.round(wDaily.temperature_2m_min[i]),
                precip: `${precipProb}%`,
                humidity: humidityVal,
                status: wDetails.desc,
                wind: `${Math.round(wDaily.wind_speed_10m_max[i])} km/h`,
                uv: getUvText(wDaily.uv_index_max[i])
            });
        }

        // Map AQI Daily Data
        aqiForecastData = aggregateHourlyToDaily(aData.hourly);

        // Render current selection
        renderForecastList();
        selectDay(selectedDayIndex);
    }).catch(err => {
        console.error("Failed loading forecast data", err);
        const container = document.getElementById('days-container');
        if (container) {
            container.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--alert-red);">Error loading forecast: ${err.message}</p>`;
        }
    });
};

// Wire tab switches
const tabWeather = document.getElementById('tab-weather');
const tabAqi = document.getElementById('tab-aqi');
const typeTitle = document.getElementById('forecast-type-title');

if (tabWeather && tabAqi) {
    tabWeather.addEventListener('click', () => {
        if (currentMode === "weather") return;
        currentMode = "weather";
        selectedDayIndex = 0;
        tabWeather.classList.add('active');
        tabAqi.classList.remove('active');
        if (typeTitle) typeTitle.innerHTML = `<i class="fa-solid fa-calendar-week" style="color:var(--primary-green)"></i> 7-Day Weather Outlook`;
        renderForecastList();
        selectDay(0);
    });

    tabAqi.addEventListener('click', () => {
        if (currentMode === "aqi") return;
        currentMode = "aqi";
        selectedDayIndex = 0;
        tabAqi.classList.add('active');
        tabWeather.classList.remove('active');
        if (typeTitle) typeTitle.innerHTML = `<i class="fa-solid fa-mask-face" style="color:var(--primary-green)"></i> 7-Day Air Quality Outlook`;
        renderForecastList();
        selectDay(0);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = getSavedLocation();
    window.loadEnvironmentalData(saved.lat, saved.lon, saved.name);

    setupSharedUIHandlers(window.loadEnvironmentalData);
});
