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
