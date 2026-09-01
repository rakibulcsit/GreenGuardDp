// Circular progress bar dimensions
const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Function to update the pointer position on the scale bar
function updateScaleIndicator(aqi) {
    const indicator = document.getElementById('aqi-scale-indicator');
    if (!indicator) return;

    let positionPercent = 0;
    let color = "#2ecc71";

    if (aqi <= 50) {
        positionPercent = (aqi / 50) * 20;
        color = "#2ecc71";
    } else if (aqi <= 100) {
        positionPercent = 20 + ((aqi - 50) / 50) * 20;
        color = "#f1c40f";
    } else if (aqi <= 150) {
        positionPercent = 40 + ((aqi - 100) / 50) * 20;
        color = "#e67e22";
    } else if (aqi <= 200) {
        positionPercent = 60 + ((aqi - 150) / 50) * 20;
        color = "#e74c3c";
    } else {
        const clampedVal = Math.min(500, aqi);
        positionPercent = 80 + ((clampedVal - 200) / 300) * 20;
        color = "#8e44ad";
    }

    // Set position and color
    indicator.style.left = `${positionPercent}%`;
    indicator.style.borderColor = color;
}

// Function to update the AQI circular gauge fill
function setAqiValue(value) {
    const gaugeFill = document.getElementById('gauge-fill');
    const aqiText = document.getElementById('aqi-value-text');
    const aqiStatus = document.getElementById('aqi-status');
    const aqiSummary = document.getElementById('aqi-summary');
    
    if (!gaugeFill || !aqiText) return;

    // Constrain AQI to range [0, 500]
    const clampedValue = Math.max(0, Math.min(500, value));
    aqiText.innerText = clampedValue;

    // Calculate percentage fill (500 is max AQI scale)
    const percentage = clampedValue / 500;
    const strokeOffset = CIRCUMFERENCE - (percentage * CIRCUMFERENCE);
    
    // Set circle offset with animation
    gaugeFill.style.strokeDasharray = `${CIRCUMFERENCE}`;
    gaugeFill.style.strokeDashoffset = strokeOffset;

    // Update the pointer position on the scale bar below the circle
    updateScaleIndicator(clampedValue);

    // Adjust colors, status, and summaries based on index ranges
    if (clampedValue <= 50) {
        gaugeFill.style.stroke = "#2ecc71";
        if (aqiStatus) {
            aqiStatus.className = "aqi-status-badge good";
            aqiStatus.innerText = "Good";
        }
        if (aqiSummary) aqiSummary.innerText = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
    } else if (clampedValue <= 100) {
        gaugeFill.style.stroke = "#f1c40f";
        if (aqiStatus) {
            aqiStatus.className = "aqi-status-badge poor";
            aqiStatus.innerText = "Moderate";
        }
        if (aqiSummary) aqiSummary.innerText = "Air quality is acceptable; however, for some pollutants, there may be a moderate health concern for a very small number of people.";
    } else if (clampedValue <= 150) {
        gaugeFill.style.stroke = "#e67e22";
        if (aqiStatus) {
            aqiStatus.className = "aqi-status-badge poor";
            aqiStatus.innerText = "Poor";
        }
        if (aqiSummary) aqiSummary.innerText = "Air quality is unhealthy for sensitive groups. Members of sensitive groups may experience health effects.";
    } else if (clampedValue <= 200) {
        gaugeFill.style.stroke = "#e74c3c";
        if (aqiStatus) {
            aqiStatus.className = "aqi-status-badge unhealthy";
            aqiStatus.innerText = "Unhealthy";
        }
        if (aqiSummary) aqiSummary.innerText = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
    } else {
        gaugeFill.style.stroke = "#8e44ad";
        if (aqiStatus) {
            aqiStatus.className = "aqi-status-badge very-unhealthy";
            aqiStatus.innerText = "Very Unhealthy";
        }
        if (aqiSummary) aqiSummary.innerText = "Health warnings of emergency conditions. The entire population is more likely to be affected.";
    }
}

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

// Helper to update a pollutant card
function updatePollutant(idPrefix, val, maxVal, safeLimit, warnLimit, isMg = false) {
    const valEl = document.getElementById(`${idPrefix}-val`);
    const fillEl = document.getElementById(`${idPrefix}-fill`);
    if (!valEl || !fillEl) return;

    const displayVal = isMg ? (val / 1000).toFixed(1) : val.toFixed(1);
    valEl.innerText = displayVal;

    const percent = Math.min(100, Math.max(5, (val / maxVal) * 100));
    fillEl.style.width = `${percent}%`;

    if (val <= safeLimit) {
        fillEl.className = "status-bar-fill safe";
    } else if (val <= warnLimit) {
        fillEl.className = "status-bar-fill warning";
    } else {
        fillEl.className = "status-bar-fill unhealthy";
    }
}

// Helper to update Advisories
function updateAdvisories(aqi) {
    const config = {
        mask: { title: "Wear a Mask Outdoors", desc: "Sensitive groups are advised to wear a particulate respirator mask (N95 or equivalent) outdoors today.", status: "warning" },
        vent: { title: "Close Windows and Doors", desc: "Keep windows and doors closed to avoid clean indoor air mixing with unhealthy outdoor atmospheric particulates.", status: "warning" },
        exercise: { title: "Reduce Outdoor Activities", desc: "Try to reduce heavy or prolonged exercise outdoors, particularly in high-traffic or heavily populated sectors.", status: "warning" },
        purifier: { title: "Use Air Purifiers", desc: "If available, run indoor air purifiers on automated speed modes to keep particulate levels low inside your residence.", status: "safe" }
    };

    if (aqi <= 50) {
        config.mask = { title: "Mask Not Required", desc: "Air quality is excellent. No respiratory protection is needed today.", status: "safe" };
        config.vent = { title: "Open Windows", desc: "Perfect weather to ventilate your rooms and let fresh outdoor air inside.", status: "safe" };
        config.exercise = { title: "Enjoy Outdoors", desc: "Conditions are perfect for running, sports, or other high-intensity physical exercises.", status: "safe" };
        config.purifier = { title: "Keep Purifier Off", desc: "Not necessary unless you have specific indoor dust or allergen concerns.", status: "safe" };
    } else if (aqi <= 100) {
        config.mask = { title: "Mask Optional", desc: "Sensitive individuals may consider wearing a mask if they experience irritation.", status: "safe" };
        config.vent = { title: "Open Windows", desc: "Open windows are generally fine, but sensitive groups should monitor changes.", status: "safe" };
        config.exercise = { title: "Outdoor Activity OK", desc: "Great for outdoor activities, but take short breaks if you are sensitive.", status: "safe" };
        config.purifier = { title: "Purifier Optional", desc: "Running purifiers on low speed helps maintain optimal indoor air quality.", status: "safe" };
    } else if (aqi > 150) {
        config.mask = { title: "Respirator Highly Recommended", desc: "Everyone should wear N95/FFP2 masks outdoors to shield lungs from fine particulate matter.", status: "unhealthy" };
        config.vent = { title: "Seal All Inlets", desc: "Keep all windows closed tightly. Recirculate indoor air and run purifiers continuously.", status: "unhealthy" };
        config.exercise = { title: "Avoid Outdoor Exertion", desc: "Do not exercise outdoors. Move physical activities inside and avoid traffic hotspots.", status: "unhealthy" };
        config.purifier = { title: "Run Purifiers at Max", desc: "Keep air purifiers running on high speed in frequently occupied rooms for protection.", status: "unhealthy" };
    }

    const setCard = (key) => {
        const iconEl = document.getElementById(`advisory-${key}-icon`);
        const titleEl = document.getElementById(`advisory-${key}-title`);
        const descEl = document.getElementById(`advisory-${key}-desc`);

        if (iconEl) iconEl.className = `advisory-icon ${config[key].status}`;
        if (titleEl) titleEl.innerText = config[key].title;
        if (descEl) descEl.innerText = config[key].desc;
    };

    setCard("mask");
    setCard("vent");
    setCard("exercise");
    setCard("purifier");
}

function updateAqiPageUI(data, cityName) {
    const curr = data.current;
    if (!curr) return;

    // Update location label
    const cityEl = document.getElementById('aqi-city-text');
    if (cityEl) cityEl.innerText = cityName;

    // Main AQI
    const aqi = Math.round(curr.us_aqi);
    setAqiValue(aqi);

    // Update individual pollutants
    updatePollutant("pm25", curr.pm2_5, 100, 12, 35);
    updatePollutant("pm10", curr.pm10, 150, 54, 154);
    updatePollutant("no2", curr.nitrogen_dioxide, 200, 53, 100);
    updatePollutant("o3", curr.ozone, 200, 100, 140);
    updatePollutant("co", curr.carbon_monoxide, 15000, 4400, 9400, true);
    updatePollutant("so2", curr.sulphur_dioxide, 150, 35, 75);

    // Update Advisories
    updateAdvisories(aqi);
}

window.loadEnvironmentalData = function(lat, lon, cityName) {
    fetchAirQualityData(lat, lon).then(data => {
        updateAqiPageUI(data, cityName);
    }).catch(err => {
        console.error("Failed loading AQI data", err);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 60000);

    const saved = getSavedLocation();
    window.loadEnvironmentalData(saved.lat, saved.lon, saved.name);

    setupSharedUIHandlers(window.loadEnvironmentalData);
});
