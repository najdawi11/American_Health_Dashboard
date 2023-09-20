const url = "http://127.0.0.1:5000/api/data";

d3.json(url).then(function (data) {
    populateDropdownAndDisplayData(data);
});

function populateDropdownAndDisplayData(data) {
    const measures = [...new Set(data.map(item => item.measure))];
    measures.forEach(measure => {
        d3.select("#selDataset").append("option").text(measure).property("value", measure);
    });
    
    // Default display
    updateDisplay(measures[0], data);
}

function updateDisplay(selectedMeasure, data) {
    const filteredData = data.filter(item => item.measure === selectedMeasure);
    displayDataInDiv(filteredData);
    createPieChart(filteredData);
    createBarChart(filteredData);
    createMapMarkers(filteredData);
}

function displayDataInDiv(data) {
    const div = d3.select("#dataDisplay");
    div.html(""); // clear current content
    data.forEach(item => {
        div.append("p").text(`${item.locationname}, ${item.statedesc} - ${item.data_value} ${item.data_value_unit}`);
    });
}

function createPieChart(data) {
    const pieDiv = d3.select("#pie");
    pieDiv.html("");
    
    const values = data.map(d => d.data_value);
    const labels = data.map(d => d.locationname);
    const trace = {
        values: values,
        labels: labels,
        type: 'pie'
    };
    
    Plotly.newPlot("pie", [trace]);
}

function createBarChart(data) {
    const barDiv = d3.select("#bar");
    barDiv.html("");
    
    const values = data.map(d => d.data_value);
    const labels = data.map(d => d.locationname);
    const trace = {
        x: labels,
        y: values,
        type: 'bar'
    };
    
    Plotly.newPlot("bar", [trace]);
}

let map;
let markersGroup;

function createMapMarkers(data) {
    // Initialize the map if it hasn't been already
    if (!map) {
        map = L.map('map').setView([37.0902, -95.7129], 4); // Default to USA's lat/long
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }

    // If we already have a markers group, clear it before adding new markers
    if (markersGroup) {
        markersGroup.clearLayers();
    }
    markersGroup = L.layerGroup().addTo(map);

    data.forEach(item => {
        if (item.geolocation && item.geolocation.coordinates) {
            const coords = item.geolocation.coordinates;
            const lat = coords[1];
            const long = coords[0];
            const description = `${item.locationname}, ${item.statedesc} - ${item.data_value} ${item.data_value_unit}`;
            L.marker([lat, long]).bindPopup(description).addTo(markersGroup);
        }
    });
}

function optionChanged(selectedMeasure) {
    d3.json(url).then(function (data) {
        updateDisplay(selectedMeasure, data);
    });
}
