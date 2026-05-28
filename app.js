// Mock Data
const observers = [
    { id: "Alice", name: "Dr. Alice Smith", role: "Observer" },
    { id: "John", name: "John Doe", role: "Observer" },
    { id: "Bob", name: "Dr. Bob Johnson", role: "Observer" }
];

const allUsers = [
    { id: 101, name: "Student A" },
    { id: 102, name: "Student B" },
    { id: 103, name: "Student C" },
    { id: 104, name: "Student D" },
    { id: 105, name: "Student E" }
];

// State
let selectedObserverId = null;
const observerAssignments = {
    "Alice": [101, 102], // Alice is observing Student A and B
    "John": [103],      // John is observing Student C
    "Bob": []          // Bob has no observees
};

// DOM Elements
const observerListEl = document.getElementById("observer-list");
const assignmentSection = document.getElementById("assignment-section");
const noSelectionMessage = document.getElementById("no-selection-message");
const selectedObserverNameEl = document.getElementById("selected-observer-name");
const blurbObserverNameEl = document.getElementById("blurb-observer-name");
const observeeListEl = document.getElementById("observee-list");
const userSearchInput = document.getElementById("user-search");
const btnSearch = document.getElementById("btn-search");
const searchResultsEl = document.getElementById("search-results");
const filterObserveesInput = document.getElementById("filter-observees");

// Initialize
function init() {
    renderObservers();
    
    // Bind search event
    btnSearch.addEventListener("click", handleSearch);
    userSearchInput.addEventListener("keyup", (e) => {
        if(e.key === "Enter") handleSearch();
    });
    
    // Bind filter event for current observees
    filterObserveesInput.addEventListener("keyup", () => {
        renderObservees();
    });
}

function renderObservers() {
    observerListEl.innerHTML = "";
    observers.forEach(obs => {
        const li = document.createElement("li");
        const isActive = obs.id === selectedObserverId;
        li.className = `observer-item ${isActive ? "active" : ""}`;
        li.setAttribute("tabindex", "0");
        li.setAttribute("role", "button");
        li.setAttribute("aria-pressed", isActive);
        li.innerHTML = `
            <div>
                <strong>${obs.name}</strong><br>
                <small class="user-id" style="color: var(--text-secondary); font-size: 0.85em;">${obs.id}@abc.edu</small>
            </div>
        `;
        li.addEventListener("click", () => selectObserver(obs.id));
        li.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectObserver(obs.id);
            }
        });
        observerListEl.appendChild(li);
    });
}

function selectObserver(id) {
    selectedObserverId = id;
    const observer = observers.find(o => o.id === id);
    
    renderObservers(); // Update active class
    
    // Show right panel content
    noSelectionMessage.classList.add("hidden");
    assignmentSection.classList.remove("hidden");
    
    selectedObserverNameEl.textContent = observer.name;
    if (blurbObserverNameEl) blurbObserverNameEl.textContent = observer.name;
    
    // Clear search and filters
    userSearchInput.value = "";
    searchResultsEl.innerHTML = "";
    filterObserveesInput.value = "";
    
    renderObservees();
}

function renderObservees() {
    observeeListEl.innerHTML = "";
    const observeeIds = observerAssignments[selectedObserverId] || [];
    
    if (observeeIds.length === 0) {
        observeeListEl.innerHTML = "<li><em>No observees assigned.</em></li>";
        return;
    }

    const filterQuery = (filterObserveesInput.value || "").toLowerCase();

    // Group the valid users, filter, and sort them alphabetically
    const observees = observeeIds
        .map(userId => allUsers.find(u => u.id === userId))
        .filter(user => user && user.name.toLowerCase().includes(filterQuery))
        .sort((a, b) => a.name.localeCompare(b.name));

    if (observees.length === 0 && filterQuery) {
        observeeListEl.innerHTML = "<li><em>No matching observees.</em></li>";
        return;
    }

    observees.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <span>${user.name}</span><br>
                <small class="user-id" style="color: var(--text-secondary); font-size: 0.85em;">${user.id}@abc.edu</small>
            </div>
            <button class="btn-remove" aria-label="Unlink ${user.name}" onclick="removeObservee(${user.id})">Unlink</button>
        `;
        observeeListEl.appendChild(li);
    });
}

function handleSearch() {
    const query = userSearchInput.value.toLowerCase();
    if (!query) return;

    const currentObservees = observerAssignments[selectedObserverId] || [];
    
    // Find users matching query who are NOT already assigned to the selected observer
    const results = allUsers.filter(u => 
        u.name.toLowerCase().includes(query) && 
        !currentObservees.includes(u.id)
    );

    renderSearchResults(results);
}

function renderSearchResults(results) {
    searchResultsEl.innerHTML = "";
    
    if (results.length === 0) {
        searchResultsEl.innerHTML = "<li><em>No matching users found or all matches are already assigned.</em></li>";
        return;
    }

    results.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <span>${user.name}</span><br>
                <small class="user-id" style="color: var(--text-secondary); font-size: 0.85em;">${user.id}@abc.edu</small>
            </div>
            <button class="btn-assign" aria-label="Link ${user.name}" onclick="assignObservee(${user.id})">Link</button>
        `;
        searchResultsEl.appendChild(li);
    });
}

// Make functions global so inline onclick can find them
window.assignObservee = function(userId) {
    if (!observerAssignments[selectedObserverId]) {
        observerAssignments[selectedObserverId] = [];
    }
    observerAssignments[selectedObserverId].push(userId);
    
    renderObservees();
    handleSearch(); // Refresh search list to remove the newly assigned user
};

window.removeObservee = function(userId) {
    observerAssignments[selectedObserverId] = observerAssignments[selectedObserverId].filter(id => id !== userId);
    
    renderObservees();
    if (userSearchInput.value) {
        handleSearch(); // Refresh search list to add back the removed user if they match the current search
    }
};

init();
