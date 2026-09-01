// Function to update the badge showing the number of active alerts
function updateAlertsCount() {
    const container = document.getElementById('alerts-container');
    const countBadge = document.getElementById('active-alerts-count');
    if (container && countBadge) {
        const count = container.querySelectorAll('.alert-item-box').length;
        countBadge.innerText = count;
    }
}

// Function to dismiss a specific alert
function dismissAlert(alertId) {
    const alertBox = document.getElementById(alertId);
    if (alertBox) {
        const title = alertBox.querySelector('h4') ? alertBox.querySelector('h4').innerText : "Alert";
        alertBox.style.transition = "all 0.3s ease";
        alertBox.style.opacity = "0";
        alertBox.style.transform = "translateX(-20px)";
        
        setTimeout(() => {
            alertBox.remove();
            updateAlertsCount();
            logActivity('alert', 'Alert Dismissed', `Dismissed alert: "${title}"`);
        }, 300);
    }
}

// Global reference of simulated alerts, so we don't wipe them when location updates
let simulatedAlertsHtml = [];

// Setup Alert Simulator click trigger
const triggerBtn = document.getElementById('btn-trigger-sim');
if (triggerBtn) {
    triggerBtn.addEventListener('click', function() {
        const titleInput = document.getElementById('sim-title');
        const descInput = document.getElementById('sim-desc');
        const severitySelect = document.getElementById('sim-severity');
        const container = document.getElementById('alerts-container');

        const title = titleInput.value.trim() || "Simulated Alert";
        const desc = descInput.value.trim() || "This is a simulated alert generated using the simulator panel.";
        const severity = severitySelect.value; // danger, warning, info

        if (!container) return;

        let iconClass = "fa-solid fa-circle-info";
        if (severity === 'danger') {
            iconClass = "fa-solid fa-triangle-exclamation";
        } else if (severity === 'warning') {
            iconClass = "fa-solid fa-radiation";
        }

        const alertId = 'alert-' + Date.now();
        const saved = getSavedLocation();

        const alertHtml = `
            <div class="alert-item-box ${severity}" id="${alertId}" style="opacity: 0; transform: translateY(-10px); transition: all 0.3s ease;">
                <div class="alert-item-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="alert-item-details">
                    <h4>${title}</h4>
                    <p>${desc}</p>
                    <div class="alert-meta">
                        <span><i class="fa-solid fa-location-dot"></i> ${saved.name.split(',')[0]}</span>
                        <span><i class="fa-solid fa-clock"></i> Just Now</span>
                    </div>
                </div>
                <button class="alert-action-btn" onclick="dismissAlert('${alertId}')"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;

        // Store simulated alert so it stays
        simulatedAlertsHtml.unshift(alertHtml);

        // Prepend to container
        container.insertAdjacentHTML('afterbegin', alertHtml);

        setTimeout(() => {
            const newAlert = document.getElementById(alertId);
            if (newAlert) {
                newAlert.style.opacity = "1";
                newAlert.style.transform = "translateY(0)";
            }
        }, 50);

        updateAlertsCount();
        logActivity('alert', 'Alert Triggered', `Triggered simulated alert: "${title}"`);
    });
}

function renderLiveAlerts(weatherData, aqiData, cityName) {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    // Reset container
    container.innerHTML = "";

    const wCurrent = weatherData.current;
    const aCurrent = aqiData.current;
    const shortCity = cityName.split(',')[0];

    const liveAlerts = [];

    // Check AQI
    if (aCurrent.us_aqi > 150) {
        liveAlerts.push({
            id: 'alert-aqi-danger',
            severity: "danger",
            icon: "fa-solid fa-smog",
            title: "Critical Air Quality Index Exceedance",
            desc: `AQI index has exceeded 150 (currently ${Math.round(aCurrent.us_aqi)}) in ${shortCity}. Fine particulate matter (PM2.5) levels are elevated. High health risk for sensitive groups.`
        });
    } else if (aCurrent.us_aqi > 100) {
        liveAlerts.push({
            id: 'alert-aqi-warning',
            severity: "warning",
            icon: "fa-solid fa-triangle-exclamation",
            title: "Poor Air Quality Alert",
            desc: `AQI index is ${Math.round(aCurrent.us_aqi)} in ${shortCity}. Members of sensitive groups may experience minor health effects.`
        });
    }

    // Check Temp
    if (wCurrent.temperature_2m > 35) {
        liveAlerts.push({
            id: 'alert-temp-danger',
            severity: "danger",
            icon: "fa-solid fa-temperature-arrow-up",
            title: "Extreme Temperature Warning",
            desc: `Current temperature is ${Math.round(wCurrent.temperature_2m)}°C, which feels like ${Math.round(wCurrent.apparent_temperature)}°C. Keep hydrated, stay indoors during peak hours.`
        });
    } else if (wCurrent.temperature_2m > 30) {
        liveAlerts.push({
            id: 'alert-temp-warning',
            severity: "warning",
            icon: "fa-solid fa-temperature-arrow-up",
            title: "Elevated Temperature Warning",
            desc: `A temperature of ${Math.round(wCurrent.temperature_2m)}°C feels like ${Math.round(wCurrent.apparent_temperature)}°C. Avoid prolonged sun exposure.`
        });
    } else if (wCurrent.temperature_2m < 15) {
        liveAlerts.push({
            id: 'alert-temp-info',
            severity: "info",
            icon: "fa-solid fa-temperature-arrow-down",
            title: "Cold Weather Advisory",
            desc: `Current temp is ${Math.round(wCurrent.temperature_2m)}°C. Stay warm and wear adequate layers outdoors.`
        });
    }

    // Check Rain/Wind
    if (wCurrent.rain > 1) {
        liveAlerts.push({
            id: 'alert-rain-warning',
            severity: "warning",
            icon: "fa-solid fa-cloud-showers-heavy",
            title: "Significant Rainfall Warning",
            desc: `Rain precipitation detected. Roads may be slick and traffic could be affected. Drive safely and carry an umbrella.`
        });
    }
    if (wCurrent.wind_speed_10m > 25) {
        liveAlerts.push({
            id: 'alert-wind-warning',
            severity: "warning",
            icon: "fa-solid fa-wind",
            title: "High Winds Advisory",
            desc: `Wind speeds are up to ${wCurrent.wind_speed_10m} km/h. Secure lightweight structures.`
        });
    }

    // Add simulated alerts back
    simulatedAlertsHtml.forEach(html => {
        container.insertAdjacentHTML('beforeend', html);
    });

    // Render live alerts
    if (liveAlerts.length === 0 && simulatedAlertsHtml.length === 0) {
        const emptyHtml = `
            <div class="alert-item-box info" id="alert-safe">
                <div class="alert-item-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="alert-item-details">
                    <h4>All Environmental Metrics Safe</h4>
                    <p>No active weather or air quality hazards detected in ${shortCity}. Atmospheric conditions are within normal safety standards.</p>
                    <div class="alert-meta">
                        <span><i class="fa-solid fa-location-dot"></i> ${shortCity}</span>
                        <span><i class="fa-solid fa-clock"></i> Live Update</span>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', emptyHtml);
    } else {
        liveAlerts.forEach(alert => {
            const alertHtml = `
                <div class="alert-item-box ${alert.severity}" id="${alert.id}">
                    <div class="alert-item-icon">
                        <i class="${alert.icon}"></i>
                    </div>
                    <div class="alert-item-details">
                        <h4>${alert.title}</h4>
                        <p>${alert.desc}</p>
                        <div class="alert-meta">
                            <span><i class="fa-solid fa-location-dot"></i> ${shortCity}</span>
                            <span><i class="fa-solid fa-clock"></i> Just Now</span>
                        </div>
                    </div>
                    <button class="alert-action-btn" onclick="dismissAlert('${alert.id}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
            container.insertAdjacentHTML('afterbegin', alertHtml);
        });
    }

    updateAlertsCount();
}

window.loadEnvironmentalData = function(lat, lon, cityName) {
    Promise.all([
        fetchWeatherData(lat, lon),
        fetchAirQualityData(lat, lon)
    ]).then(([wData, aData]) => {
        renderLiveAlerts(wData, aData, cityName);
    }).catch(err => {
        console.error("Failed loading alerts", err);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const saved = getSavedLocation();
    window.loadEnvironmentalData(saved.lat, saved.lon, saved.name);

    setupSharedUIHandlers(window.loadEnvironmentalData);
});
