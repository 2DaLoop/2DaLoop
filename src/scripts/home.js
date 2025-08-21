import { navigate } from '../utils/pageRouter.js';
let selectedPlace = null;

initAutoComplete();

// search based on current location
document.getElementById("btnCurrLocation").addEventListener("click", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function (location) {
                const currLocation = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                }

                sessionStorage.setItem('searchedLocation', JSON.stringify({
                    location: currLocation,
                    address: "Current Location"
                }));

                navigate('#/nearby-facilities');
            },
            function (error) {
                let strError = '';

                // alert user to enable location sharing if denied or other error
                if (error.code === error.PERMISSION_DENIED) {
                    strError = 'Please enable location sharing in your settings!'
                } else {
                    strError = 'There was an issue getting your location!'
                }

                Swal.fire({
                    title: strError,
                    icon: 'warning',
                    confirmButtonColor: '#4A90E2'
                });
            }
        );
    }
});

// initialize autocomplete search box
async function initAutoComplete() {
    await google.maps.importLibrary("places");

    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
    placeAutocomplete.id = "place-autocomplete-input";
    placeAutocomplete.classList.add("location-input");

    const inputGroup = document.getElementById("input-group")
    if (inputGroup) {
        inputGroup.appendChild(placeAutocomplete);
        placeAutocomplete.addEventListener("gmp-select", async ({ placePrediction }) => {
            selectedPlace = placePrediction;
        });
    }
}

// Add this script after your form or at the end of your HTML
document.getElementById('btnNext').addEventListener('click', async function() {
    if (selectedPlace) {
        const place = selectedPlace.toPlace ? await selectedPlace.toPlace() : selectedPlace;
        await place.fetchFields({ fields: ['location', 'formattedAddress'] });

        sessionStorage.setItem("searchedLocation", JSON.stringify({
            location: place.location,
            address: place.formattedAddress
        }));

        navigate('#/nearby-facilities');
        return;
    }
    // If no place is selected, show SweetAlert2
    Swal.fire({
        icon: 'warning',
        title: 'Location Required',
        text: 'Please select a location from the dropdown before proceeding.',
        confirmButtonColor: '#4A90E2'
    });
});