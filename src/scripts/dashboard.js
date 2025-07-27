import ApexCharts from 'apexcharts';

initDashboard();

document.getElementById('waitlist-btn').addEventListener('click', () => {
    showWaitlistForm();
})

// hide waitlist form if user clicks off
document.querySelector('.overlay')?.addEventListener('click', (event) => {
    const form = document.querySelector('.ghl-form');
    if (form && !form.contains(event.target)) {
        form.classList.add('hidden');
        event.currentTarget.classList.remove('active');
    }
});

function initDashboard() {
    // TODO: check cookie for waitlistSubmitted, if true don't show
    if (true) {
        setTimeout(() => {
            showWaitlistForm();
        }, 4000);
    }

    drawCO2EmissionsChart();
    drawEwasteChart();
    insertValues();
    initPostMessageListener();
    // calcCarbonFootprint();
}

// hide the form after submitting
function initPostMessageListener() {
    let ghlMessageCount = 0;

    setTimeout(() => {
        window.addEventListener("message", (event) => {
            if (event.origin.includes("leadconnectorhq.com")) {
                ghlMessageCount++;

                if (ghlMessageCount === 2) {
                    setTimeout(() => {
                        document.querySelector('.ghl-form')?.classList.add('hidden');
                        document.querySelector('.overlay')?.classList.remove('active');

                        // TODO: set cookie for waitlistSubmitted = true

                    }, 2000);
                }
            }
        });
    }, 100); // small delay to ensure DOM and iframe are ready
}

function showWaitlistForm() {    
    document.querySelector('.ghl-form').classList.remove('hidden');
    document.querySelector('.overlay').classList.add('active');
}

async function drawCO2EmissionsChart() {
    const csvUrl = "https://ourworldindata.org/grapher/annual-co2-emissions-per-country.csv?v=1&csvType=filtered&useColumnShortNames=true&time=2000..latest&country=OWID_WRL~Europe+%28GCP%29~OWID_NAM";

    const response = await fetch(csvUrl);
    const csv = await response.text();

    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    const yearIndex = headers.indexOf("Year");
    const emissionsIndex = headers.indexOf("emissions_total");
    const entityIndex = headers.indexOf("Entity");

    const selectedEntities = ["World", "North America", "Europe (GCP)"];
    const entityData = {};

    selectedEntities.forEach(e => entityData[e] = []);

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");

        const entity = row[entityIndex];
        const year = parseInt(row[yearIndex]);
        const value = parseFloat(row[emissionsIndex]);

        if (selectedEntities.includes(entity) && !isNaN(year) && !isNaN(value)) {
            entityData[entity].push([new Date(year, 0).getTime(), value]);
        }
    }

    const series = selectedEntities.map((entity, i) => ({
        name: entity,
        data: entityData[entity]
    }));

    const options = {
        chart: {
            type: 'line',
            height: 400,
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: '#FFFFFF'
        },
        series: series,
        xaxis: {
            type: 'datetime',
            title: { 
                text: 'Year',
                style: {
                    fontSize: '14px'
                }
            }
        },
        yaxis: {
            title: { 
                text: 'Billion Tonnes CO₂',
                style: {
                    fontSize: '14px'
                } 
            },
            labels: {
                formatter: function (val) {
                    return (val / 1000000000).toFixed(2) + " billion t"
                }
            }
        },
        legend: {
            position: "top"
        }
    };

    const chart = new ApexCharts(document.getElementById("carbon-footprint-chart"), options);
    chart.render();
}

async function drawEwasteChart() {
    const csvUrl = "https://ourworldindata.org/grapher/electronic-waste-recycling-rate.csv?v=1&csvType=filtered&useColumnShortNames=true&time=earliest..2022&country=OWID_WRL~Europe+%28UN%29~Northern+America+%28UN%29";
    const response = await fetch(csvUrl);
    const csv = await response.text();

    const lines = csv.split("\n");
    const headers = lines[0].split(",");

    const entityIndex = headers.indexOf("Entity");
    const yearIndex = headers.indexOf("Year");
    const valueIndex = headers.indexOf("_12_5_1__en_ewt_rcyr");

    const selectedEntities = ["World", "Northern America (UN)", "Europe (UN)"];
    const entityData = {};

    selectedEntities.forEach(e => entityData[e] = []);

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");

        const entity = row[entityIndex];
        const year = parseInt(row[yearIndex]);
        const value = parseFloat(row[valueIndex]);

        if (selectedEntities.includes(entity) && !isNaN(year) && !isNaN(value)) {
            entityData[entity].push([new Date(year, 0).getTime(), value]);
        }
    }

    const series = selectedEntities.map((entity, i) => ({
        name: entity,
        data: entityData[entity]
    }));

    const options = {
        chart: {
            type: 'line',
            height: 400,
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: '#FFFFFF'
        },
        series: series,
        xaxis: {
            type: 'datetime',
            title: { 
                text: "Year",
                style: {
                    fontSize: '14px'
                }
            }
        },
        yaxis: {
            title: { 
                text: "Recycling Rate (%)" ,
                style: {
                    fontSize: '14px'
                }
            },
            labels: {
                formatter: function (val) {
                    return val + "%"
                }
            }
        },
        tooltip: {
            x: { format: "yyyy" }
        },
        legend: {
            position: "top"
        }
    };

    const chart = new ApexCharts(document.querySelector("#ewaste-chart"), options);
    chart.render();
}

function insertValues() {
    const data = getGHGResults();

    // insert metric values or hide sections if no data
    if (data) {
        document.getElementById('ghg-emissions').textContent += data.ghg_emissions;
    
        document.getElementById('powering-houses').textContent = data.powering_houses;
        document.getElementById('removing-cars').textContent = data.removing_cars;
        document.getElementById('solid-waste').textContent = data.solid_waste;
        document.getElementById('air-emissions').textContent = data.air_emissions;
        document.getElementById('water-emissions').textContent = data.water_emissions;
    } else {
        document.getElementById('emissions-section').classList.add('hidden')
        document.getElementById('equivalents-section').classList.add('hidden')
    }


}

// TODO: maybe add metric card for carbon footprint reduction
function calcCarbonFootprint() {
    const data = getGHGResults();
    if (data) {
        const estPounds = data.total_est_weight;
    
        // 1kg of electronics results in emission of 25kg of carbon
        // lbs to kg = lbs / 2.205
    
        const estKilograms = estPounds / 2.205;
        const estEmissions = estKilograms * 25;

        return estEmissions
    }
}

function getGHGResults() {
    const results = JSON.parse(sessionStorage.getItem("ghgResults"))?.results.data;
    if (results) {
        return results
    } else {
        return null
    }
}