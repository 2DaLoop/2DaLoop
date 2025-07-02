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
