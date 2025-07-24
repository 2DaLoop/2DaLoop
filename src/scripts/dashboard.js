import ApexCharts from 'apexcharts';

initDashboard();

function initDashboard() {
    showWaitlistForm();
    drawCO2EmissionsChart()
    drawEwasteChart()
    insertValues();
    calcCarbonFootprint();
    initPostMessageListener();
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
                    }, 2000);
                }
            }
        });
    }, 100); // small delay to ensure DOM and iframe are ready
}

function showWaitlistForm() {
    setTimeout(() => {
        document.querySelector('.ghl-form').classList.remove('hidden');
        document.querySelector('.overlay').classList.add('active');
    }, 4000);
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
        console.log(entity)

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
        console.log(entity)

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

// async function drawFilteredEmissionsChart() {
//     // CHANGE THIS to "Carbon dioxide" or "Methane"
//     const targetFlowable = "Carbon dioxide";

//     const response = await fetch("src/assets/csv/filtered_sector_emissions_with_titles.csv");
//     const text = await response.text();

//     const rows = text.trim().split("\n").map(row => row.split(","));
//     const headers = rows[0];
//     const dataRows = rows.slice(1);

//     const emissionsBySector = {};

//     for (const row of dataRows) {
//         const obj = {};
//         headers.forEach((key, i) => obj[key] = row[i]);

//         if (obj["Flowable"] !== targetFlowable) continue;

//         const sector = obj["SectorTitle"];
//         const year = parseInt(obj["Year"]);
//         const value = parseFloat(obj["FlowAmount"]);

//         if (isNaN(year) || isNaN(value)) continue;

//         if (!emissionsBySector[sector]) emissionsBySector[sector] = [];

//         emissionsBySector[sector].push({
//             x: new Date(year, 0).getTime(), // datetime X-axis
//             y: value
//         });
//     }

//     const data = Object.entries(emissionsBySector).map(([sector, seriesData]) => ({
//         name: sector,
//         data: seriesData.sort((a, b) => a.x - b.x)
//     }));

//     const chart = new ApexCharts(document.querySelector("#sector-chart"), {
//         chart: {
//             type: 'line',
//             height: 600,
//             zoom: { enabled: false }
//         },
//         series: data,
//         xaxis: {
//             type: 'datetime',
//             title: { text: 'Year' }
//         },
//         yaxis: {
//             title: { text: 'Flow Amount (kg or g)' },
//             labels: {
//                 formatter: (val) => {
//                     if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + 'B';
//                     if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + 'M';
//                     if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + 'K';
//                     return val;
//                 }
//             }
//         },
//         tooltip: {
//             shared: false,
//             intersect: false,
//             x: {
//                 format: 'yyyy'
//             }
//         },
//         legend: {
//             show: true,
//             position: 'bottom',
//             horizontalAlign: 'center',
//             floating: false,
//             labels: {
//                 useSeriesColors: false
//             },
//             itemMargin: {
//                 horizontal: 10,
//                 vertical: 5
//             }
//         },
//         title: {
//             text: `${targetFlowable} Emissions by Sector (2012–2022)`,
//             align: 'center'
//         }
//     });

//     chart.render();
// }

function insertValues() {
    const data = getGHGResults();

    document.getElementById('ghg-emissions').textContent += data.ghg_emissions;

    document.getElementById('powering-houses').textContent = data.powering_houses;
    document.getElementById('removing-cars').textContent = data.removing_cars;
    document.getElementById('solid-waste').textContent = data.solid_waste;
    document.getElementById('air-emissions').textContent = data.air_emissions;
    document.getElementById('water-emissions').textContent = data.water_emissions;
}

function calcCarbonFootprint() {
    const data = getGHGResults();

    const estPounds = data.total_est_weight;

    // 1kg of electronics results in emission of 25kg of carbon
    // lbs to kg = lbs / 2.205

    const estKilograms = estPounds / 2.205;
    const estEmissions = estKilograms * 25;
}

function getGHGResults() {
    return JSON.parse(sessionStorage.getItem("ghgResults")).results.data;
}