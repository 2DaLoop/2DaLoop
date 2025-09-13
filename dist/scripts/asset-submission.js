// clear button functionality for asset submission page
let btnclear = document.querySelector('.clear-btn');
let inputs = document.querySelectorAll('.quantity-input, .age-input');

btnclear.addEventListener('click', () => {
    inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '#d1d5db'; // Reset border color
    });
});

// input validation, only positive integers and 0-30 for age
inputs.forEach(input => {
    input.addEventListener('input', () => {
        const isAge = input.classList.contains('age-input');
        const value = input.value;

        if (
            value &&
            (
                !/^\d*\.?\d+$/.test(value) ||
                parseFloat(value) < 0 ||
                (isAge && parseFloat(value) > 30)
            )
        ) {
            input.style.borderColor = '#ef4444';
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Input',
                    text: isAge
                        ? 'Age must be a positive integer below 30.'
                        : 'Please enter a positive integer.',
                    confirmButtonColor: '#3085d6'
                });
            }
            input.value = '';
        } else {
            input.style.borderColor = '#d1d5db';
        }
    });
});

// create a click event listener for the import button
let importButton = document.querySelector('.import-btn');
importButton.addEventListener('click', function (e) {
    e.preventDefault();
    Swal.fire({
        title: 'Accepted CSV Data: CSV Format (example.csv)',
        html: `
            <div style="display: flex; justify-content: center; align-items: flex-start; gap: 24px; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="font-weight: bold; margin-bottom: 8px;">example1.csv</div>
                    <img src="/images/CSVExample.png" alt="Example 1" style="width:340px;max-width:45vw;border-radius:8px;display:block;">
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="font-weight: bold; margin-bottom: 8px;">example2.csv</div>
                    <img src="/images/notepad.png" alt="Example 2" style="width:340px;max-width:45vw;border-radius:8px;display:block;">
                </div>
            </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3766A5',
        width: 800
    }).then((result) => {
        if (result.isConfirmed) {
            triggerFileInput();
        }
    });
});

// When a file is selected, parse and process the CSV
document.getElementById('csvFileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        processCSV(e.target.result);
    };
    reader.readAsText(file);
});

// Mapping CSV category names to field ID prefixes
const categoryMap = {
    "desktops": "desktop",
    "laptops": "laptop",
    "battery backups": "battery",
    "mobile devices": "mobile",
    "printer": "printer",
    "misc components": "misc-comp",
    "monitor": "monitor"
};

function processCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(cell => cell.trim());

        const categoryName = row[0].trim().toLowerCase();
        const quantity = row[1];
        const age = row[2];

        const idPrefix = categoryMap[categoryName];
        if (!idPrefix) {
            console.warn(`Unknown category: ${categoryName}`);
            continue;
        }

        const quantityInput = document.getElementById(`${idPrefix}-quantity`);
        const ageInput = document.getElementById(`${idPrefix}-age`);

        if (quantityInput) quantityInput.value = quantity;
        if (ageInput) ageInput.value = age;
    }
}

function triggerFileInput() {
    document.getElementById('csvFileInput').click();
}

// create a click event listener for the export button
let exportButton = document.querySelector('.export-btn');
exportButton.addEventListener('click', () => {
    // create a JSON object from the inputs
    let data = [];
    inputs.forEach(input => {
        if (input.value) {
            data.push({
                id: input.id,
                value: input.value
            });
        }
    });

    // create a blob from the JSON object
    let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    let url = URL.createObjectURL(blob);

    // create a link element to download the blob
    let a = document.createElement('a');
    a.href = url;
    a.download = 'asset-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// input validation and submit asset data to calculator
document.querySelector('.calculate-btn').addEventListener('click', async () => {
    // get all data from form
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const ageInputs = document.querySelectorAll('.age-input');

    // input validation
    let hasAnyInput = false;
    let hasMismatch = false;

    for (let i = 0; i < quantityInputs.length; i++) {
        const qty = quantityInputs[i].value.trim();
        const age = ageInputs[i].value.trim();

        const qtyFilled = qty !== '' && qty !== '0';
        const ageFilled = age !== '' && age !== '0';

        if (qtyFilled || ageFilled) {
            hasAnyInput = true;
        }

        if ((qtyFilled && !ageFilled) || (!qtyFilled && ageFilled)) {
            hasMismatch = true;
            break;
        }
    }

    // Check for no inputs at all
    if (!hasAnyInput && typeof Swal !== "undefined") {
        await Swal.fire({
            icon: 'warning',
            title: 'No Data Detected',
            text: 'Please enter quantities and ages before calculating.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    // Check for mismatched inputs
    if (hasMismatch && typeof Swal !== "undefined") {
        await Swal.fire({
            icon: 'warning',
            title: 'Empty Field(s)',
            text: 'Each quantity field with a value must have a corresponding age field filled (and vice versa).',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    // if all input is valid
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: 'question',
            title: 'Confirm Submission',
            text: 'Are you sure all information is correct before calculating?',
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Edit',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // remove existing ghg results if available
                sessionStorage.removeItem('ghgResults');
                sessionStorage.setItem('newAssetSubmission', true);

                // show loader/ewaste facts and hide inventory form
                document.querySelector('.inventory-container').classList.add('hidden');
                document.querySelector('.loader').classList.remove('hidden');
                loadEwasteFacts();

                // get budget results
                const budgetResponse = await submitAssetsForBudget(quantityInputs, ageInputs);
                const data = convertToNums(budgetResponse.data);
                sessionStorage.setItem('comparisonData', JSON.stringify(data));

                // store in supabase and load charts
                storeData(quantityInputs, ageInputs);
                document.getElementById('ewaste-facts').style.display = "none";
                document.querySelector('.loader').classList.add('hidden');
                document.getElementById('comparison-chart').classList.remove('hidden');
                if (data && Object.keys(data).length > 0) {
                    loadChart(data);
                }

                // get ghg results
                const ghgResults = await submitAssetsForGHG(quantityInputs);

                // store to be used on dashboard page
                sessionStorage.setItem('ghgResults', JSON.stringify({
                    results: ghgResults
                }));
            }
        });
    }
})

// submit to esg calculator and go to dashbaord
document.querySelector('#next-btn').addEventListener('click', async () => {
    window.navigate('#/dashboard')
})

// calculate totals for budget
async function submitAssetsForBudget(quantityInputs, ageInputs) {
    return await fetch('/calculate/budget', {
        method: 'POST',
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            inputValues: {
                desktop_pc_quantity: quantityInputs[0].value || 0,
                laptop_pc_quantity: quantityInputs[1].value || 0,
                network_device_quantity: quantityInputs[5].value || 0,
                telecom_quantity: quantityInputs[3].value || 0,
                server_quantity: 0,
                desktop_pc_age: ageInputs[0].value || 0,
                laptop_pc_age: ageInputs[1].value || 0,
                network_device_age: ageInputs[5].value || 0,
                telecom_age: ageInputs[3].value || 0,
                server_age: 0
            }
        })
    })
    .then(response => response.json())
}

// calculate results for emissions, etc
async function submitAssetsForGHG(quantityInputs) {
    return await fetch('/calculate/ghg', {
        method: 'POST',
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            inputValues: {
                Laptops: quantityInputs[1].value || 0,
                Servers: 0,
                Desktops: quantityInputs[0].value || 0,
                Battery: quantityInputs[2].value || 0,
                Mobile: quantityInputs[3].value || 0,
                Printers: quantityInputs[4].value || 0,
                Storage: quantityInputs[5].value || 0,
                Monitors: quantityInputs[6].value || 0
            }
        })
    })
    .then(response => response.json())
}

// store in supabase
async function storeData(quantityInputs, ageInputs) {
    const { error } = await window.supabase
        .from('tblAssetSubmission')
        .insert({
            desktop_quantity: quantityInputs[0].value || 0,
            desktop_age: ageInputs[0].value || 0,
            laptop_quantity: quantityInputs[1].value || 0,
            laptop_age: ageInputs[1].value || 0,
            battery_backup_quantity: quantityInputs[2].value || 0,
            battery_backup_age: ageInputs[2].value || 0,
            mobile_device_quantity: quantityInputs[3].value || 0,
            mobile_device_age: ageInputs[3].value || 0,
            printer_quantity: quantityInputs[4].value || 0,
            printer_age: ageInputs[4].value || 0,
            misc_comp_quantity: quantityInputs[5].value || 0,
            misc_comp_age: ageInputs[5].value || 0,
            monitor_quantity: quantityInputs[6].value || 0,
            monitor_age: ageInputs[6].value || 0
        })
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
        title: {
            text: 'Standard Burden Shift ITAD Process vs 2DaLoop Reintegration Potential',
            align: 'center',
            style: {
                fontSize: '20px'
            }
        },
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

function loadEwasteFacts() {
    // Show "Why Recycling Tech Matters" facts card below loader
    let factsDiv = document.getElementById('ewaste-facts');
    if (!factsDiv) {
        factsDiv = document.createElement('div');
        factsDiv.id = 'ewaste-facts';
        factsDiv.style.margin = '32px auto 0 auto';
        factsDiv.style.maxWidth = '1200px'; // 2x bigger than before (was 600px)
        factsDiv.style.background = '#f7f9fc';
        factsDiv.style.border = '1px solid #3766A5';
        factsDiv.style.borderRadius = '12px';
        factsDiv.style.padding = '24px 28px';
        factsDiv.style.fontSize = '1.1rem';
        factsDiv.style.color = '#222';
        factsDiv.style.boxShadow = '0 2px 12px rgba(55,102,165,0.08)';
        factsDiv.innerHTML = `
            <div style="font-size:1.5rem;margin-bottom:12px;text-align:center;">🌍 Why Recycling Tech Matters: 5 Key Facts</div>
            <ul style="padding-left:18px;line-height:1.7;">
                <li><b> Current Problem:</b> Many organizations (government offices, schools, manufacturers, and small businesses) struggle to find reliable electronics recycling or reuse partners because existing directories are outdated and links are broken.</li>
                <li><b>Our Solution: </b> The Suggestion Engine provides real-time connections to verified facilities—recyclers, repair shops, and reintegration partners—tailored to your location, asset type, and needs.</li>
                <li><b>The Outcome:</b> Organizations can decommission electronics more efficiently and sustainably, saving time and ensuring assets are reused or recycled responsibly instead of going to landfills.</li>
            </ul>
        `;
        // Insert after loader
        const loader = document.querySelector('.loader');
        if (loader && loader.parentNode) {
            loader.parentNode.insertBefore(factsDiv, loader.nextSibling);
        }
    } else {
        factsDiv.style.display = '';
        factsDiv.style.maxWidth = '1200px'; // Ensure width is updated if already exists
    }
}

function convertToNums(results) {
    const data = {};

    for (const category in results) {
        if (results.hasOwnProperty(category)) {
            data[category] = {};

            for (const key in results[category]) {
                if (results[category].hasOwnProperty(key)) {
                    let value = results[category][key];
                    value = Number(value.replace(/[$,()]/g, ''));
                    data[category][key] = isNaN(value) ? 0 : value;
                }
            }
        }
    }

    return data;
}