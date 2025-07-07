// clear button functionality for asset submission page
let btnclear = document.querySelector('.clear-btn');
let inputs = document.querySelectorAll('.quantity-input, .age-input');

btnclear.addEventListener('click', () => {
    inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '#d1d5db'; // Reset border color
    });
});

// SweetAlert2 validation: only allow positive numbers (integers or decimals) in inputs,
// and limit to 30 years ONLY for age fields
inputs.forEach(input => {
    input.addEventListener('input', () => {
        const isAge = input.classList.contains('age-input');
        const value = input.value;

        if (
            value &&
            (
                !/^\d*\.?\d+$/.test(value) ||
                parseFloat(value) <= 0 ||
                (isAge && parseFloat(value) > 30)
            )
        ) {
            input.style.borderColor = '#ef4444';
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Input',
                    text: isAge
                        ? 'Please enter a positive whole number not greater than 30 for age.'
                        : 'Please enter a positive whole number only.',
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

// create a click event listener for the calculate button to confirm all information is correct
let calculateButton = document.querySelector('.calculate-btn');
if (calculateButton) {
    calculateButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default form submission

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
            }).then((result) => {
                if (result.isConfirmed) {
                    // Proceed with calculation logic here
                    // calculateResults();
                }
                // If cancelled, do nothing so user can edit fields
            });
        } else {
            // Proceed with calculation logic here if Swal is not available
            // calculateResults();
        }
    });
}



