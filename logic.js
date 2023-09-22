const url = "http://127.0.0.1:5000/api/data";
d3.json(url).then(function (data) {
    populateDropdownAndDisplayData(data);
});
function optionChanged(selectedMeasure) {
    updateDisplay(selectedMeasure, data);
}

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
    data.sort((a, b) => b.data_value - a.data_value); // Sort data in descending order
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
    // Sort data by data_value in descending order and slice the top 5
    const sortedData = data.sort((a, b) => b.data_value - a.data_value).slice(0, 5);
    
    const values = sortedData.map(d => d.data_value);
    const labels = sortedData.map(d => d.locationname);
    
    const pieTrace = {
        values: values,
        labels: labels,
        type: 'pie',
        hoverinfo: 'label+percent+name',
        textinfo: 'none'
    };

    const layout = {
        title: "Top 5 Locations by Value Distribution"
    };

    Plotly.newPlot("pie", [pieTrace], layout);
}






function createBarChart(data) {
    const values = data.map(d => d.data_value);
    const labels = data.map(d => d.statedesc);
    const barTrace = {
        x: labels,
        y: values,
        type: 'bar',
        hoverinfo: 'x+y+name',
        marker: {
            color: 'rgb(55, 83, 109)'
        }
    };

    const layout = {
        title: "Value by State"
    };

    Plotly.newPlot("bar", [barTrace], layout);
}

let map;
let markersGroup;

function createMapMarkers(data) {
    data = data.slice(0, 5);
    // Initialize the map if it hasn't been already
    if (!map) {
        map = L.map('map').setView([37.0902, -95.7129], 3); // Default to USA's lat/long
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
