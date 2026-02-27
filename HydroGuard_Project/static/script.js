// --- 1. SETUP MAP & PIPELINES ---
var map = L.map('map').setView([20.9300, 77.7600], 13); 

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var amcIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

L.marker([20.9650, 77.7650], {icon: amcIcon}).addTo(map)
    .bindPopup(`<b style="color:#d29922;">AMC Master Balancing Reservoir</b><br>Primary City Supply Hub`).openPopup();

const zoneLocations = {
    "ZONE_1": { lat: 20.9320, lng: 77.7650, name: "Maltekdi ESR" },
    "ZONE_2": { lat: 20.9450, lng: 77.7750, name: "Navsari ESR" },
    "ZONE_3": { lat: 20.9500, lng: 77.7600, name: "VMV ESR" },
    "ZONE_4": { lat: 20.9250, lng: 77.7700, name: "Dastur Nagar ESR" },
    "ZONE_5": { lat: 20.9250, lng: 77.7610, name: "Rajapeth ESR" },
    "ZONE_6": { lat: 20.9150, lng: 77.7600, name: "Sainagar ESR" },
    "ZONE_7": { lat: 20.9050, lng: 77.7550, name: "Akoli ESR" },
    "ZONE_8": { lat: 20.8900, lng: 77.7500, name: "Badnera ESR" }
};

var nodeCircles = {};
var activePin = null; 

for (let key in zoneLocations) {
    let loc = zoneLocations[key];
    let circle = L.circleMarker([loc.lat, loc.lng], {
        radius: 7, fillColor: "#00ffcc", color: "#151b23", weight: 2, fillOpacity: 0.9
    }).addTo(map);

    circle.on('click', function() {
        if (activePin) { map.removeLayer(activePin); }
        let bluePin = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
        activePin = L.marker([loc.lat, loc.lng], {icon: bluePin}).addTo(map).bindPopup(`<b>${loc.name}</b>`).openPopup();
        document.getElementById('zoneSelect').value = key; 
        document.getElementById('zoneSelect').dispatchEvent(new Event('change'));
    });
    nodeCircles[key] = circle;
}

var pipeSegments = {
    "AMC_TRUNK": L.polyline([[20.9650, 77.7650], [20.9320, 77.7650]], { color: '#58a6ff', weight: 5, opacity: 0.8 }).addTo(map), 
    "BRANCH_VMV": L.polyline([[20.9320, 77.7650], [20.9500, 77.7600]], { color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map), 
    "BRANCH_NAVSARI": L.polyline([[20.9320, 77.7650], [20.9450, 77.7750]], { color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map), 
    "BRANCH_DASTUR": L.polyline([[20.9320, 77.7650], [20.9250, 77.7700]], { color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map), 
    "SOUTH_1": L.polyline([[20.9320, 77.7650], [20.9250, 77.7610]], { color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map), 
    "SOUTH_2": L.polyline([[20.9250, 77.7610], [20.9150, 77.7600]], { color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map), 
    "SOUTH_3": L.polyline([[20.9150, 77.7600], [20.9050, 77.7550]], { color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map), 
    "SOUTH_4": L.polyline([[20.9050, 77.7550], [20.8900, 77.7500]], { color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map)  
};
var exactLeakMarker = null; 

// --- 2. SETUP CHARTS ---
let currentChartZone = "ZONE_8"; 
document.getElementById('zoneSelect').addEventListener('change', function(e) {
    currentChartZone = e.target.value;
    [flowChart, pressureChart, confidenceChart].forEach(chart => { chart.data.labels = []; chart.data.datasets[0].data = []; chart.update(); });
});

const commonChartOptions = { responsive: true, maintainAspectRatio: false, scales: { x: { display: false }, y: { grid: { color: '#30363d'} } }, animation: false, plugins: { legend: { display: false } } };

var flowChart = new Chart(document.getElementById('flowChart').getContext('2d'), { type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#00ffcc', backgroundColor: 'rgba(0, 255, 204, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }] }, options: { ...commonChartOptions, scales: { ...commonChartOptions.scales, y: { min: 350, max: 600, grid: { color: '#30363d'} } } } });
var pressureChart = new Chart(document.getElementById('pressureChart').getContext('2d'), { type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#2ea043', backgroundColor: 'rgba(46, 160, 67, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }] }, options: { ...commonChartOptions, scales: { ...commonChartOptions.scales, y: { min: 0, max: 70, grid: { color: '#30363d'} } } } });
var confidenceChart = new Chart(document.getElementById('confidenceChart').getContext('2d'), { type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#d29922', backgroundColor: 'rgba(210, 153, 34, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }] }, options: { ...commonChartOptions, scales: { ...commonChartOptions.scales, y: { min: 0, max: 100, grid: { color: '#30363d'} } } } });

// --- 3. MAIN LOOP (FETCH DATA & UPDATE UI) ---
function fetchData() {
    fetch('/get-data')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('zone-table-body');
            tableBody.innerHTML = ""; 

            data.zones.forEach(zone => {
                let rowColor = "#2ea043"; // Default Green
                let statusText = "Normal";

                // --- NEW 3-STAGE LOGIC FOR COLORS ---
                if (zone.status === "Critical") {
                    rowColor = "#ff3333"; // RED
                    statusText = "CRITICAL BURST";
                } else if (zone.status === "Warning") {
                    rowColor = "#d29922"; // ORANGE/GOLD
                    statusText = "MEDIUM LEAK";
                }

                // Map Circles Update
                if (nodeCircles[zone.id]) { nodeCircles[zone.id].setStyle({ fillColor: rowColor }); }

                // Table Update
                tableBody.innerHTML += `
                    <tr style="border-bottom: 1px solid #30363d; cursor: pointer; transition: 0.3s;" 
                        onclick="document.getElementById('zoneSelect').value = '${zone.id}'; document.getElementById('zoneSelect').dispatchEvent(new Event('change'));">
                        <td style="padding: 10px; color: #c9d1d9;">${zone.name}</td>
                        <td style="padding: 10px; font-weight: bold; color: ${rowColor};">${zone.pressure} PSI</td>
                        <td style="padding: 10px;"><span style="background: ${rowColor}; padding: 3px 8px; border-radius: 4px; font-size: 11px; color: black; font-weight: 800;">${statusText}</span></td>
                    </tr>
                `;

                if (zone.id === currentChartZone) { updateTelemetryCharts(zone); }

                // Line Color Logic
                // --- LINE COLOR & EXACT LOCATION PIN LOGIC ---
                if (zone.id === "ZONE_8" && pipeSegments["SOUTH_4"]) {
                    let leakLat = 20.8975; 
                    let leakLng = 77.7525;

                    if (zone.status === "Critical") {
                        // 1. Turn pipeline RED (Thick)
                        pipeSegments["SOUTH_4"].setStyle({ color: '#ff3333', dashArray: null, opacity: 1, weight: 6 });
                        triggerAlerts(zone);

                        // Clear any previous Warning pins
                        if (exactLeakMarker) { map.removeLayer(exactLeakMarker); exactLeakMarker = null; }
                        if (activePin) { map.removeLayer(activePin); activePin = null; }

                        // 2. DROP RED CRITICAL PIN & CIRCLE
                        exactLeakMarker = L.circleMarker([leakLat, leakLng], {
                            radius: 12, fillColor: "#ff3333", color: "#ffffff", weight: 3, opacity: 1, fillOpacity: 0.9
                        }).addTo(map);
                        exactLeakMarker.bindPopup(`<b style="color:#ff3333;">CRITICAL BURST LOCATION</b><br>Lat: ${leakLat}<br>Lng: ${leakLng}<br>Depth: 1.4m`).openPopup();
                        
                        let redPin = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
                        activePin = L.marker([leakLat, leakLng], {icon: redPin}).addTo(map);

                    } else if (zone.status === "Warning") {
                        // 1. Turn pipeline ORANGE (Dashed)
                        pipeSegments["SOUTH_4"].setStyle({ color: '#d29922', dashArray: '5, 10', opacity: 1, weight: 4 });
                        
                        // Clear any previous pins to avoid overlapping
                        if (exactLeakMarker) { map.removeLayer(exactLeakMarker); exactLeakMarker = null; }
                        if (activePin) { map.removeLayer(activePin); activePin = null; }

                        // 2. DROP ORANGE WARNING PIN & CIRCLE
                        exactLeakMarker = L.circleMarker([leakLat, leakLng], {
                            radius: 9, fillColor: "#d29922", color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.8
                        }).addTo(map);
                        exactLeakMarker.bindPopup(`<b style="color:#d29922;">MEDIUM LEAK DETECTED</b><br>Lat: ${leakLat}<br>Lng: ${leakLng}<br>Send Inspection Team`).openPopup();
                        
                        let orangePin = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
                        activePin = L.marker([leakLat, leakLng], {icon: orangePin}).addTo(map);

                    } else {
                        // 1. Turn pipeline CYAN (Normal)
                        pipeSegments["SOUTH_4"].setStyle({ color: '#00ffcc', weight: 3, opacity: 0.5, dashArray: '5, 10' });
                        
                        // 2. Remove ALL pins when healthy
                        if (exactLeakMarker) { map.removeLayer(exactLeakMarker); exactLeakMarker = null; }
                        if (activePin) { map.removeLayer(activePin); activePin = null; }
                    }
                }
            });
        }).catch(err => console.error("Error fetching data:", err));
}

function updateTelemetryCharts(zone) {
    let timeNow = new Date().toLocaleTimeString();
    if (pressureChart.data.labels.length > 20) {
        flowChart.data.labels.shift(); flowChart.data.datasets[0].data.shift();
        pressureChart.data.labels.shift(); pressureChart.data.datasets[0].data.shift();
        confidenceChart.data.labels.shift(); confidenceChart.data.datasets[0].data.shift();
    }
    flowChart.data.labels.push(timeNow); flowChart.data.datasets[0].data.push(zone.flow);
    pressureChart.data.labels.push(timeNow); pressureChart.data.datasets[0].data.push(zone.pressure);
    confidenceChart.data.labels.push(timeNow); confidenceChart.data.datasets[0].data.push(zone.confidence);

    let pressureBadge = document.getElementById('pressure-badge');
    let confBadge = document.getElementById('confidence-badge');

    // --- CHART BADGE COLORS (3 STAGES) ---
    if (zone.status === "Critical") {
        pressureChart.data.datasets[0].borderColor = '#ff3333'; pressureChart.data.datasets[0].backgroundColor = 'rgba(255, 51, 51, 0.2)';
        pressureBadge.innerText = "CRITICAL BURST"; pressureBadge.style.color = "#ff3333"; pressureBadge.style.background = "rgba(255,51,51,0.1)";
        confidenceChart.data.datasets[0].borderColor = '#ff3333'; confidenceChart.data.datasets[0].backgroundColor = 'rgba(255, 51, 51, 0.2)';
        confBadge.innerText = "High Probability"; confBadge.style.color = "#ff3333"; confBadge.style.background = "rgba(255,51,51,0.1)";
    } else if (zone.status === "Warning") {
        pressureChart.data.datasets[0].borderColor = '#d29922'; pressureChart.data.datasets[0].backgroundColor = 'rgba(210, 153, 34, 0.2)';
        pressureBadge.innerText = "MEDIUM LEAK"; pressureBadge.style.color = "#d29922"; pressureBadge.style.background = "rgba(210,153,34,0.1)";
        confidenceChart.data.datasets[0].borderColor = '#d29922'; confidenceChart.data.datasets[0].backgroundColor = 'rgba(210, 153, 34, 0.2)';
        confBadge.innerText = "Suspicious Drop"; confBadge.style.color = "#d29922"; confBadge.style.background = "rgba(210,153,34,0.1)";
    } else {
        pressureChart.data.datasets[0].borderColor = '#2ea043'; pressureChart.data.datasets[0].backgroundColor = 'rgba(46, 160, 67, 0.1)';
        pressureBadge.innerText = "Stable"; pressureBadge.style.color = "#2ea043"; pressureBadge.style.background = "rgba(46,160,67,0.1)";
        confidenceChart.data.datasets[0].borderColor = '#2ea043'; confidenceChart.data.datasets[0].backgroundColor = 'rgba(46, 160, 67, 0.1)';
        confBadge.innerText = "Nominal"; confBadge.style.color = "#2ea043"; confBadge.style.background = "rgba(46,160,67,0.1)";
    }
    flowChart.update(); pressureChart.update(); confidenceChart.update();
}

let lastAlertTime = 0; 
function triggerAlerts(zone) {
    const now = Date.now();
    if (now - lastAlertTime > 8000) { 
        let message = new SpeechSynthesisUtterance();
        message.text = `Warning. Major pipeline burst detected near ${zone.name}.`;
        window.speechSynthesis.speak(message);
        
        let estLoss = (1000 - (zone.pressure * 15)).toFixed(0); 
        let logContainer = document.getElementById('alert-log-container');
        logContainer.innerHTML = `
            <div style="border-left: 4px solid #f85149; background: rgba(248,81,73,0.05); padding: 12px; margin-bottom:10px;">
                <b style="color: #f85149; font-size: 12px;">CRITICAL BURST DETECTED</b><br>
                <span style="color: #c9d1d9; font-size: 12px;">Location: ${zone.name} Line<br>Est Loss: ${estLoss} L/min</span>
            </div>
        ` + logContainer.innerHTML;
        lastAlertTime = now;
    }
}

setInterval(fetchData, 1000);