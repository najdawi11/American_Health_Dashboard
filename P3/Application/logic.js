const url = "http://127.0.0.1:5000/api/data";

// Pull data from Flask API
d3.json(url).then(function (data) {
    populateDropdownAndDisplayData(data);
});

// Create the dropdown with d3 and populate with data
var dropdown = d3.select("#selDataset");

function populateDropdownAndDisplayData(data) {
    const uniqueMeasures = {};
    data.forEach((item) => {
        let measure = item.measure;
        uniqueMeasures[measure] = true;
    });
    const uniqueMeasureNames = Object.keys(uniqueMeasures);
    dropdown.html("");
    uniqueMeasureNames.forEach((measure) => {
        dropdown.append("option").text(measure).property("value", measure);
    });
    dropdown.on("change", function () {
        const selectedMeasure = this.value;
        const aggregatedData = aggregateDataByMeasure(data, selectedMeasure);
        displayDataInDiv(aggregatedData);
        updateMapMarkers(aggregatedData);
        createPieChart(aggregatedData);

        // Update bar chart on dropdown change
        const aggregatedStatesData = aggregateDataByState(data, selectedMeasure);
        createBarChart(aggregatedStatesData);
    });
    const initialMeasure = uniqueMeasureNames[0];
    const initialData = aggregateDataByMeasure(data, initialMeasure);
    displayDataInDiv(initialData);
    createMap(initialData);
    createPieChart(initialData);
    const aggregatedStatesData = aggregateDataByState(data, initialMeasure);
    createBarChart(aggregatedStatesData);
}

let map = null;
function createMap(data) {
    if (map !== null) {
        return;
    }
    map = L.map('map').setView([40.7128, -74.0060], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    createMapMarkers(data);
}

function updateMapMarkers(data) {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    createMapMarkers(data);
}

function createMapMarkers(data) {
    data.forEach(item => {
        const { coordinates } = item.geolocation;
        const { measure, statedesc, countyname, category, data_value, data_value_unit } = item;
        const lat = coordinates[1];
        const lng = coordinates[0];
        const marker = L.marker([lat, lng]).addTo(map).bindPopup(
            `<b>${measure}</b><br>${category}<br><br>Value: ${data_value} (${data_value_unit})<br><br>${countyname}<br><br>${statedesc}<br>`
        );
    });
}

function aggregateDataByMeasure(data, selectedMeasure) {
    return data.filter((item) => item.measure === selectedMeasure);
}

function displayDataInDiv(data) {
    const displayDiv = d3.select("#dataDisplay");
    displayDiv.html("");
    data.forEach((item) => {
        const { measure, category, data_value, data_value_type, data_value_unit, countyname, statedesc, year } = item;
        const paragraph = displayDiv.append("p");
        paragraph.text(`${countyname}, ${statedesc}\n\nMeasure: ${measure}\n\nCategory: ${category}\n\nValue: ${data_value} (${data_value_unit})`);
    });
}

function createPieChart(data) {
    const pieDiv = d3.select("#pie");
    pieDiv.html("");
    const width = 450,
        height = 450,
        margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    const svg = pieDiv.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    const pie = d3.pie()
        .value(function(d) {return d.data_value; });
    data.sort((a, b) => b.data_value - a.data_value);
    const topFiveData = data.slice(0, 5);
    const data_ready = pie(topFiveData);

    // Define the color scale
    const color = d3.scaleOrdinal()
        .domain(data_ready.map(d => d.data.countyname))
        .range(d3.schemeCategory10);

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    svg.selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        // use the color scale
        .attr('fill', d => color(d.data.countyname))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    const textOffset = 14;
    const slices = svg.selectAll('mySlices')
        .data(data_ready)
        .enter();

    // Create one text element for the county name
    slices.append('text')
        .text(d => d.data.countyname)
        .attr("transform", d => "translate(" + arcGenerator.centroid(d) + ")")
        .attr("dy", -textOffset) // offset by 14 upwards
        .style("text-anchor", "middle")
        .style("font-size", 15);

    // Create a separate text element for the state description
    slices.append('text')
        .text(d => d.data.statedesc)
        .attr("transform", d => "translate(" + arcGenerator.centroid(d) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 15);

    // Create a separate text element for the data value
    slices.append('text')
        .text(d => d.data.data_value)
        .attr("transform", d => "translate(" + arcGenerator.centroid(d) + ")")
        .attr("dy", textOffset) // offset by 14 downwards
        .style("text-anchor", "middle")
        .style("font-size", 15);
}



function aggregateDataByState(data, selectedMeasure) {
    let stateCounts = {};
    data.filter((item) => item.measure === selectedMeasure)
        .forEach((item) => {
            if (!(item.statedesc in stateCounts)) {
                stateCounts[item.statedesc] = 0;
            }
            stateCounts[item.statedesc] += 1;
        });
    return Object.entries(stateCounts).map(([key, value]) => ({ state: key, count: value }));
}

function createBarChart(data) {
    const barDiv = d3.select("#bar");
    barDiv.html("");
    const margin = {top: 10, right: 30, bottom: 90, left: 40},
        width = 460 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;
    const svg = barDiv.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    const y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(function(d) { return d.state; }))
        .padding(0.2);
    svg.append("g")
        .call(d3.axisLeft(y));
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.count; })])
        .range([ 0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.state); })
        .attr("width", function(d) { return x(d.count); })
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2");
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "value")
            .attr("y", function(d) { return y(d.state) + y.bandwidth() / 2; })
            .attr("x", function(d) { return x(d.count); })
            .attr("dx", -5)
            .text(function(d) { return d.count; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end");
    }
    