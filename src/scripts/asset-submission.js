import ApexCharts from 'apexcharts';
import { supabase } from '../supabase/supabaseClient.js';

// clear button functionality for asset submission page
let btnclear = document.querySelector('.clear-btn');
let inputs = document.querySelectorAll('.quantity-input, .age-input');

btnclear.addEventListener('click', () => {
    inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '#d1d5db'; // Reset border color
    });
});

// SweetAlert2 validation: only allow positive numbers (integers or decimals) in inputs, and limit to 30 years
inputs.forEach(input => {
    input.addEventListener('input', () => {
        // If input is not a positive number or greater than 30, show SweetAlert2 and clear the field
        if (
            input.value &&
            (
                !/^\d*\.?\d+$/.test(input.value) ||
                parseFloat(input.value) <= 0 ||
                parseFloat(input.value) > 30
            )
        ) {
            input.style.borderColor = '#ef4444';
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Input',
                    text: 'Please enter a positive number not greater than 30.',
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
importButton.addEventListener('click', () => {
    // create a file input element
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    // accept csv files too
    fileInput.accept = '.json, .csv'; // accept only JSON and CSV files

    // create a change event listener for the file input
    fileInput.addEventListener('change', (event) => {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function(e) {
                try {
                    let data = JSON.parse(e.target.result);
                    data.forEach(item => {
                        let quantityInput = document.getElementById(item.id);
                        if (quantityInput) {
                            quantityInput.value = item.value;
                        }
                    });
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            };
            reader.readAsText(file);
        }
    });

    // trigger the file input click
    fileInput.click();
});

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

// TODO: make alert if there is an input for quantity but not age, and vice versa
// TODO: fix so the new category fields correspond to the ITAD calculator correctly
document.querySelector('.calculate-btn').addEventListener('click', async () => {
    // get all data from form
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const ageInputs = document.querySelectorAll('.age-input');

    // show loader and hide inventory form
    document.querySelector('.inventory-container').classList.add('hidden');
    document.querySelector('.loader').classList.remove('hidden');

    // get results from itad calculator
    const noPackingResponse = await submitAssetsNoPacking(quantityInputs, ageInputs);
    const packingResponse = await submitAssetsPackingServices(quantityInputs, ageInputs);

    // convert strings to numbers
    const noPackingData = convertToNums(noPackingResponse.data);
    const packingData = convertToNums(packingResponse.data);

    // store in supabase and load charts
    storeData(quantityInputs, ageInputs);
    loadCharts(noPackingData, packingData);
})

async function submitAssetsNoPacking(quantityInputs, ageInputs) {
    // use puppeteer to calculate totals
    return await fetch('http://localhost:3000/itad/no_packing', {
        method: 'POST',
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            inputValues: {
                desktop_pc_quantity: quantityInputs[0].value || 0,
                laptop_pc_quantity: quantityInputs[1].value || 0,
                network_device_quantity: quantityInputs[2].value || 0,
                telecom_quantity: quantityInputs[3].value || 0,
                server_quantity: quantityInputs[4].value || 0,
                desktop_pc_age: ageInputs[0].value || 0,
                laptop_pc_age: ageInputs[1].value || 0,
                network_device_age: ageInputs[2].value || 0,
                telecom_age: ageInputs[3].value || 0,
                server_age: ageInputs[4].value || 0
            }
        })
    })
    .then(response => response.json())
}

async function submitAssetsPackingServices(quantityInputs, ageInputs) {
    // use puppeteer to calculate totals
    return await fetch('http://localhost:3000/itad/packing_services', {
        method: 'POST',
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            inputValues: {
                desktop_pc_quantity: quantityInputs[0].value || 0,
                laptop_pc_quantity: quantityInputs[1].value || 0,
                network_device_quantity: quantityInputs[2].value || 0,
                telecom_quantity: quantityInputs[3].value || 0,
                server_quantity: quantityInputs[4].value || 0,
                desktop_pc_age: ageInputs[0].value || 0,
                laptop_pc_age: ageInputs[1].value || 0,
                network_device_age: ageInputs[2].value || 0,
                telecom_age: ageInputs[3].value || 0,
                server_age: ageInputs[4].value || 0
            }
        })
    })
    .then(response => response.json())
}

async function storeData(quantityInputs, ageInputs) {
    // store in supabase
    const { error } = await supabase
        .from('tblAssetSubmission')
        .insert({
            desktop_quantity: quantityInputs[0].value || 0,
            laptop_quantity: quantityInputs[1].value || 0,
            network_device_quantity: quantityInputs[2].value || 0,
            telecom_quantity: quantityInputs[3].value || 0,
            server_quantity: quantityInputs[4].value || 0,
            desktop_age: ageInputs[0].value || 0,
            laptop_age: ageInputs[1].value || 0,
            network_device_age: ageInputs[2].value || 0,
            telecom_age: ageInputs[3].value || 0,
            server_age: ageInputs[4].value || 0
        })
}

function loadCharts(noPackingData, packingData) {
    document.querySelector('.loader').classList.add('hidden');
    document.getElementById('comparison-charts').classList.remove('hidden');

    const noPackingOptions = {
        chart: {
            type: 'bar',
            height: 400
        },
        colors: ['#feb019d9', '#feb019d9', '#FF2C2C', '#00e396d9'],
        plotOptions: {
            bar: {
                horizontal: false,
                distributed: true,
            }
        },
        dataLabels: {
            formatter: function (val) {
                return val< 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
            },
        },
        series: [{
            name: 'Price',
            data: [
                Number(noPackingData.total_service_fees) || 0,
                Number(noPackingData.total_value_recovery) || 0,
                Number(noPackingData.total_pickup_cost) || 0,
                Number(noPackingData.net_financial_settlement) || 0
            ]
        }],
        title: {
            text: 'No Packing Services',
            align: 'center',
            style: {
                fontSize: '20px'
            }
        },
        xaxis: {
            categories: ['Total Service Fees', "Total Value Recovery", "Total Pickup Cost", "Net Financial Settlement"],
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
            show: false
        }
    };

    const packingOptions = {
        chart: {
            type: 'bar',
            height: 400
        },
        colors: ['#feb019d9', '#feb019d9', '#FF2C2C', '#00e396d9'],
        plotOptions: {
            bar: {
                horizontal: false,
                distributed: true,
            }
        },
        dataLabels: {
            formatter: function (val) {
                return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
            },
        },
        series: [{
            name: 'Price',
            data: [
                Number(packingData.total_service_fees) || 0,
                Number(packingData.total_value_recovery) || 0,
                Number(packingData.total_pickup_cost) || 0,
                Number(packingData.net_financial_settlement) || 0
            ]
        }],
        title: {
            text: 'Packing Services',
            align: 'center',
            style: {
                fontSize: '20px'
            }
        },
        xaxis: {
            categories: ['Total Service Fees', "Total Value Recovery", "Total Pickup Cost", "Net Financial Settlement"],
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
            show: false
        }
    };

    const noPackingChart = new ApexCharts(document.getElementById('no-packing-chart'), noPackingOptions);
    const packingChart = new ApexCharts(document.getElementById('packing-chart'), packingOptions);

    noPackingChart.render();
    packingChart.render();
}

function convertToNums(results) {
    // convert results to numbers
    const data = {};
    for (const key in results) {
        if (results.hasOwnProperty(key)) {
            let value = results[key];
            // remove $, commas, and (), then convert to number
            value = Number(value.replace(/[$,()]/g, ''));
            data[key] = isNaN(value) ? 0 : value; // handle NaN values
        }
    }
    return data;
}