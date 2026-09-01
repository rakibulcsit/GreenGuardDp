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

// Global point state tracking
let currentPoints = 15;
const maxPoints = 100;

// Function to handle toggling action items in the eco checklist
function toggleActionItem(itemId) {
    const itemLabel = document.getElementById(itemId);
    if (!itemLabel) return;

    const checkbox = itemLabel.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    const ptsValue = parseInt(checkbox.getAttribute('data-points')) || 0;
    const actionText = itemLabel.querySelector('.action-checkbox-text') ? 
        itemLabel.querySelector('.action-checkbox-text').innerText : "Eco Action";

    if (checkbox.checked) {
        // Checked state
        itemLabel.classList.add('checked');
        currentPoints += ptsValue;
        logActivity('eco', 'Checked Eco Action', `Completed action: ${actionText}`);
    } else {
        // Unchecked state
        itemLabel.classList.remove('checked');
        currentPoints -= ptsValue;
        logActivity('eco', 'Unchecked Eco Action', `Undid action: ${actionText}`);
    }

    // Ensure points are kept within bounds
    currentPoints = Math.max(0, currentPoints);

    // Update the UI elements
    updateEcoScore();
}

// Function to update Eco Score panel elements and text levels
function updateEcoScore() {
    const ptsCount = document.getElementById('pts-count');
    const ptsProgress = document.getElementById('pts-progress');
    const rankTitle = document.querySelector('.eco-score-tracker h2');

    if (ptsCount) ptsCount.innerText = currentPoints;
    
    if (ptsProgress) {
        const percentage = Math.min(100, (currentPoints / maxPoints) * 100);
        ptsProgress.style.width = `${percentage}%`;
    }

    // Dynamic Rank Title adjustment
    if (rankTitle) {
        if (currentPoints >= 70) {
            rankTitle.innerText = "Planet Champion";
            rankTitle.style.color = "#4ade80"; // Bright green
        } else if (currentPoints >= 40) {
            rankTitle.innerText = "Green Hero";
            rankTitle.style.color = "#a3e635"; // Lime green
        } else {
            rankTitle.innerText = "Eco Explorer";
            rankTitle.style.color = "#cbd5e1"; // Off white
        }
    }

    // Congratulatory Alert trigger
    if (currentPoints >= 100) {
        // Delay alert slightly for smooth visual progression
        setTimeout(() => {
            alert("Congratulations! You've reached 100 Green Points and achieved the highest Green Level rank! Keep up the amazing eco-friendly work! 🌱🌍");
        }, 300);
    }
}

// Core Event listener validating city search query input configurations
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        let city = document.getElementById('city-input').value.trim();
        if(city) {
            alert('Filtering daily local environmental tips for: ' + city);
            logActivity('search', 'City Search Query', `Filtered daily local eco tips for ${city} from Tips Page`);
        } else {
            alert('Please enter a city name.');
        }
    });
}

// Location button click handler
const locationBtn = document.querySelector('.location-btn');
if (locationBtn) {
    locationBtn.addEventListener('click', function() {
        alert('Finding micro-climate eco tips for your location...');
        logActivity('location', 'Location Requested', 'Requested microclimate eco tips by location');
    });
}
