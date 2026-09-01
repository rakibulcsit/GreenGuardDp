// Format timestamp to a human-readable local time or relative duration
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just Now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Function to pull logs and render the timeline
function renderHistory() {
    const container = document.getElementById('timeline-entries');
    const emptyState = document.getElementById('empty-state');
    
    if (!container) return;

    // Get logs from localStorage
    let history = JSON.parse(localStorage.getItem('greenguard_history') || '[]');

    // If empty, let's load default realistic mock logs on first visit
    if (history.length === 0) {
        const now = new Date();
        history = [
            {
                type: "eco",
                title: "Checked Eco Action",
                desc: "Completed action: Checked off reusable grocery bag (+10 pts)",
                timestamp: new Date(now.getTime() - 15 * 60000).toISOString()
            },
            {
                type: "search",
                title: "City Search Query",
                desc: "Searched environmental metrics for Dhaka, Bangladesh",
                timestamp: new Date(now.getTime() - 45 * 60000).toISOString()
            },
            {
                type: "alert",
                title: "Warning Alert Logged",
                desc: "System active alert triggered: Critical Air Quality Index Exceedance (danger)",
                timestamp: new Date(now.getTime() - 90 * 60000).toISOString()
            }
        ];
        localStorage.setItem('greenguard_history', JSON.stringify(history));
    }

    // Hide/show empty state
    if (history.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        updateStats(0, 0, 0);
        return;
    } else {
        if (emptyState) emptyState.style.display = 'none';
    }

    // Clean container, leaving only emptyState hidden inside
    const children = Array.from(container.children);
    children.forEach(child => {
        if (child.id !== 'empty-state') child.remove();
    });

    // Populate timeline items
    let searchCount = 0;
    let actionCount = 0;
    let alertCount = 0;

    history.forEach(item => {
        // Calculate counts
        if (item.type === 'search') searchCount++;
        else if (item.type === 'eco') actionCount++;
        else if (item.type === 'alert') alertCount++;

        // Determine icon based on category type
        let iconClass = "fa-solid fa-info";
        if (item.type === 'search') iconClass = "fa-solid fa-magnifying-glass";
        else if (item.type === 'location') iconClass = "fa-solid fa-location-crosshairs";
        else if (item.type === 'eco') iconClass = "fa-solid fa-leaf";
        else if (item.type === 'alert') iconClass = "fa-solid fa-bell";

        const timelineHtml = `
            <div class="timeline-item ${item.type}">
                <div class="timeline-marker">
                    <i class="${iconClass}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-title-row">
                        <h4>${item.title}</h4>
                        <span class="timeline-time">${formatTime(item.timestamp)}</span>
                    </div>
                    <p class="timeline-desc">${item.desc}</p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', timelineHtml);
    });

    // Update cumulative session stats
    updateStats(searchCount, actionCount, alertCount);
}

// Function to update the summary metrics numbers in the DOM
function updateStats(searches, actions, alerts) {
    const sEl = document.getElementById('stat-searches');
    const acEl = document.getElementById('stat-actions');
    const alEl = document.getElementById('stat-alerts');

    if (sEl) sEl.innerText = searches;
    if (acEl) acEl.innerText = actions;
    if (alEl) alEl.innerText = alerts;
}

// Clear History button listener
const clearBtn = document.getElementById('btn-clear');
if (clearBtn) {
    clearBtn.addEventListener('click', function() {
        if (confirm("Are you sure you want to clear your system activity logs? This cannot be undone.")) {
            localStorage.setItem('greenguard_history', JSON.stringify([]));
            renderHistory();
        }
    });
}

// Render history list on run
renderHistory();

// Core Event listener validating city search query input configurations
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        let city = document.getElementById('city-input').value.trim();
        if(city) {
            alert('Loading history records for: ' + city);
        } else {
            alert('Please enter a city name.');
        }
    });
}

// Location button click handler
const locationBtn = document.querySelector('.location-btn');
if (locationBtn) {
    locationBtn.addEventListener('click', function() {
        alert('Querying regional GPS tracker histories...');
    });
}
