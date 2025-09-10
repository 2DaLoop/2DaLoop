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
    if (!hasCookie('waitlistSubmitted')) {
        setTimeout(() => {
            showWaitlistForm();
        }, 4000);
    } else {
        showFullReport();
    }

    drawCO2EmissionsChart();
    drawEwasteChart();
    checkForValues();
    initPostMessageListener();
}

document.getElementById("export-pdf-btn").addEventListener("click", () => {
    const element = document.querySelector(".dashboard-container");

    const opt = {
        margin:       0.5,
        filename:     'dashboard.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true }, // scale improves quality, useCORS allows external images
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
});

// hide the form after submitting
function initPostMessageListener() {
    let ghlMessageCount = 0;

    setTimeout(() => {
        window.addEventListener("message", (event) => {
            if (event.origin.includes("leadconnectorhq.com") && Array.isArray(event.data) && event.data.length === 5) {
                ghlMessageCount++;

                if (ghlMessageCount === 2) {
                    setTimeout(() => {
                        document.querySelector('.ghl-form')?.classList.add('hidden');
                        document.querySelector('.overlay')?.classList.remove('active');

                        if (localStorage.getItem('cookieAccepted')) {
                            document.cookie = "waitlistSubmitted=true; max-age=31536000;";
                        }

                        // show full report data
                        showFullReport();
                    }, 2000);
                }
            }
        });
    }, 100); // small delay to ensure DOM and iframe are ready
}

function showWaitlistForm() {    
    document.querySelector('.ghl-form')?.classList.remove('hidden');
    document.querySelector('.overlay')?.classList.add('active');
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

function checkForValues(maxRetries = 30, interval = 1000) {
    // if data already exists
    let data = getGHGResults();
    if (data) {
        insertValues(data);
        return;
    } else {
        // check if new data was submitted
        if (!sessionStorage.getItem('newAssetSubmission')) {
            document.getElementById('emissions-section').classList.add('hidden');
            document.getElementById('equivalents-section').classList.add('hidden');
            return;
        };

        let retries = 0;

        // wait for new ghg results to be available
        const tryCheck = () => {
            data = getGHGResults();

            if (data) {
                sessionStorage.removeItem('newAssetSubmission');

                insertValues(data);
            } else if (retries < maxRetries) {
                retries++;
                setTimeout(tryCheck, interval);
            } else {
                document.getElementById('emissions-section').classList.add('hidden');
                document.getElementById('equivalents-section').classList.add('hidden');
            }
        };

        tryCheck();
    }
}

function insertValues(data) {
    document.getElementById('ghg-emissions').textContent += data.ghg_emissions;
    document.getElementById('powering-houses').textContent = data.powering_houses;
    document.getElementById('removing-cars').textContent = data.removing_cars;
    document.getElementById('solid-waste').textContent = data.solid_waste;
    document.getElementById('air-emissions').textContent = data.air_emissions;
    document.getElementById('water-emissions').textContent = data.water_emissions;

    // calculate estimated carbon footprint
    const estPounds = Number(data.total_est_weight.replace(/[$,()]/g, ''));
    const estEmissions = estPounds * 25;

    document.getElementById('carbon-footprint').textContent = estEmissions.toFixed(2);
}

function showFullReport() {
    // if data exists
    const data = JSON.parse(sessionStorage.getItem('comparisonData'))
    if (data && Object.keys(data).length > 0) {
        // show comparison chart
        document.getElementById('comparison-section').classList.remove('hidden');
        loadChart(data);

        // show location
        document.getElementById('location-section').classList.remove('hidden');
        const location = JSON.parse(sessionStorage.getItem('searchedLocation'))?.address;
        if (location) {
            document.querySelector('.location-text').textContent = location;
        } else {
            document.querySelector('.location-text').textContent = "No Location Provided";
        }
    }
}

function loadChart(data) {
    const options = {
        chart: {
            type: 'bar',
            height: 500
        },
        colors: ['#00A721', '#3766a5'],
        plotOptions: {
            bar: {
                horizontal: false,
            }
        },
        dataLabels: {
            formatter: function (val) {
                return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
            },
        },
        series: [{
            name: 'Standard Burden Shift',
            data: [
                Number(data.packing.total_value_recovery) || 0,
                -(Number(data.packing.total_pickup_cost)) || 0,
                Number(data.packing.net_financial_settlement) || 0
            ]}, {
            name: '2DaLoop Potential',
            data: [
                Number(data.noPacking.total_value_recovery) || 0,
                -(Number(data.noPacking.total_pickup_cost)) || 0,
                Number(data.noPacking.net_financial_settlement) || 0
            ]
        }],
        xaxis: {
            categories: ["Total Value Recovery", "Total Pickup Cost", "Net Financial Settlement"],
            title: {
                text: 'Revenue and Costs',
                style: {
                    fontSize: "16px"
                }
            },
        },
        yaxis: {
            title: {
                text: 'Price ($)',
                style: {
                    fontSize: "16px"
                }
            },
            labels: {
                formatter: function(val) {
                    return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
                },
                style: {
                    fontSize: '16px',
                }
            }
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
            offsetY: -20
        }
    };

    const chart = new ApexCharts(document.getElementById('grouped-bar-chart'), options);
    chart.render();
}

function getGHGResults() {
    const results = JSON.parse(sessionStorage.getItem("ghgResults"))?.results.data;
    if (results) {
        return results
    } else {
        return null
    }
}

// check if a cookie exists
function hasCookie(name) {
    return document.cookie.split('; ').some(cookie => cookie.trim().startsWith(`${name}=`));
}