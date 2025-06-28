// Example function to validate input and show SweetAlert
function validateAssetInput(inputValue) {
    // Check if input is a non-negative whole number
    if (!/^\d+$/.test(inputValue)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Please enter only whole numbers with positive value.',
            confirmButtonColor: '#3085d6'
        });
        return false;
    }
    return true;
}

// Example usage: attach to an input field
document.querySelectorAll('.asset-number-input').forEach(input => {
    input.addEventListener('change', function () {
        validateAssetInput(this.value);
    });
});