initDashboard();

function initDashboard() {
    showWaitlistForm();
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

function insertValues() {
    const data = getGHGResults();

    document.getElementById('ghg-emissions').textContent = data.ghg_emissions;

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