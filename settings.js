// Helper function to log activities to localStorage for the history page
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

// Function to update user rank based on localStorage points
function updateProfileRank() {
    const rankBadge = document.getElementById('profile-rank');
    if (!rankBadge) return;

    const points = parseInt(localStorage.getItem('greenguard_points') || '15');
    
    if (points >= 70) {
        rankBadge.innerText = "Planet Champion";
        rankBadge.style.backgroundColor = "#e2f2ea";
        rankBadge.style.color = "var(--primary-green)";
    } else if (points >= 40) {
        rankBadge.innerText = "Green Hero";
        rankBadge.style.backgroundColor = "#eafaf1";
        rankBadge.style.color = "var(--accent-green)";
    } else {
        rankBadge.innerText = "Eco Explorer";
        rankBadge.style.backgroundColor = "#f1f5f9";
        rankBadge.style.color = "var(--text-muted)";
    }
}

// Check Dark Mode preference and apply to body
function initDarkMode() {
    const darkModeToggle = document.getElementById('toggle-dark-mode');
    const isDark = localStorage.getItem('greenguard_dark_mode') === 'enabled';
    
    if (darkModeToggle) {
        darkModeToggle.checked = isDark;
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('greenguard_dark_mode', 'enabled');
                logActivity('search', 'Theme Mode Changed', 'Enabled High-Contrast Dark Theme Mode');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('greenguard_dark_mode', 'disabled');
                logActivity('search', 'Theme Mode Changed', 'Disabled High-Contrast Dark Theme Mode');
            }
        });
    }

    if (isDark) {
        document.body.classList.add('dark-theme');
    }
}

// Setup Event Listeners for selectors
function initSelectors() {
    // Temperature Unit Selector
    const tempUnitSelect = document.getElementById('select-temp-unit');
    if (tempUnitSelect) {
        const savedUnit = localStorage.getItem('greenguard_temp_unit') || 'celsius';
        tempUnitSelect.value = savedUnit;
        tempUnitSelect.addEventListener('change', function() {
            localStorage.setItem('greenguard_temp_unit', this.value);
            logActivity('search', 'Unit Preference Changed', `Changed temperature display scale to ${this.value}`);
        });
    }

    // Refresh Rate Selector
    const refreshRateSelect = document.getElementById('select-refresh-rate');
    if (refreshRateSelect) {
        const savedRate = localStorage.getItem('greenguard_refresh_rate') || 'auto';
        refreshRateSelect.value = savedRate;
        refreshRateSelect.addEventListener('change', function() {
            localStorage.setItem('greenguard_refresh_rate', this.value);
            logActivity('search', 'Refresh Rate Changed', `Changed sensor refresh interval to ${this.value}`);
        });
    }
}

// Danger Zone Reset buttons
function initDangerZone() {
    // Reset points button
    const resetPointsBtn = document.getElementById('btn-reset-points');
    if (resetPointsBtn) {
        resetPointsBtn.addEventListener('click', function() {
            if (confirm("Are you sure you want to reset your Eco Checklist Points to 0?")) {
                localStorage.setItem('greenguard_points', '0');
                updateProfileRank();
                logActivity('eco', 'Checklist Reset', 'Reset today\'s green action points to 0');
                alert("Eco Points reset successfully!");
            }
        });
    }

    // Clear activity logs
    const clearLogsBtn = document.getElementById('btn-clear-logs');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            if (confirm("Are you sure you want to delete all activity and search logs?")) {
                localStorage.setItem('greenguard_history', JSON.stringify([]));
                logActivity('alert', 'Activity Registry Wiped', 'Cleared system activity history logs');
                alert("System logs wiped successfully!");
            }
        });
    }
}

// Initializing settings functions
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initSelectors();
    initDangerZone();
    updateProfileRank();
});

// Fallback in case DOMContentLoaded has already fired
initDarkMode();
initSelectors();
initDangerZone();
updateProfileRank();

// Core Event listener validating city search query input configurations
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        let city = document.getElementById('city-input').value.trim();
        if(city) {
            alert('Settings page filter: ' + city);
        } else {
            alert('Please enter a city name.');
        }
    });
}

// Location button click handler
const locationBtn = document.querySelector('.location-btn');
if (locationBtn) {
    locationBtn.addEventListener('click', function() {
        alert('Querying nearest regional settings server...');
    });
}
