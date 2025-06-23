const API_KEY = window.ENV.API_KEY;

(g => {var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => {await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a)})); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))})({
    key: API_KEY,
    v: "weekly",
});

const { Map } = await google.maps.importLibrary("maps");
const { Place, SearchBox } = await google.maps.importLibrary("places");
const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
const { LatLngBounds, event } = await google.maps.importLibrary("core");

const centerPosition = { lat: 39.8283, lng: -98.5795 }; // Geographic center of continental U.S.
let searchedLocation = null;
let map;
let markers = [];
let selectedPlace = null;

initAutoComplete();

// search based on current location
document.getElementById("btnCurrLocation").addEventListener("click", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function (location) {
                searchedLocation = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                };

                await initMap();
                await searchText();
                // await searchLocation();
            },
            function (error) {
                let strError = "";

                // alert user to enable location sharing if denied or other error
                if (error.code === error.PERMISSION_DENIED) {
                    strError =
                        "Please enable location sharing in your settings!";
                } else {
                    strError = "There was an issue getting your location!";
                }
                alert(strError);
            }
        );
    }
});

// initialize map centered on the U.S.
window.initMap = async function () {
    const content = document.getElementById("main-content")
    content.innerHTML = `<div id="map"></div>`;

    map = new Map(document.getElementById("map"), {
        center: centerPosition,
        zoom: 4,
        mapId: "e8f578253d8c676318b940c1-",
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DEFAULT,
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
    });

    // create search input, 'Recyle', and 'Repair' button options
    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("card", "card-body", "gap-2");

    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
    placeAutocomplete.id = "place-autocomplete-input";

    const recycleBtn = document.createElement("button");
    recycleBtn.textContent = "Recycle";
    recycleBtn.type = "button";
    recycleBtn.classList.add("btn", "btn-light");
    // show navy blue icon of recycling symbol in button


    const repairBtn = document.createElement("button");
    repairBtn.textContent = "Repair";
    repairBtn.type = "button";
    repairBtn.classList.add("btn", "btn-light");


    optionsDiv.append(placeAutocomplete, repairBtn, recycleBtn);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(optionsDiv);

    // listeners for search input and filter options
    placeAutocomplete.addEventListener("gmp-select", async ({ placePrediction }) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['location'] });

        searchedLocation = place.location;
        await searchText();
    });

    recycleBtn.addEventListener("click", async () => {
        await searchGeoJson();
    });

    repairBtn.addEventListener("click", async () => {
        await searchText();
    });
}

// initialize autocomplete search box
function initAutoComplete() {
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
    placeAutocomplete.id = "place-autocomplete-input";
    placeAutocomplete.classList.add("location-input");
    document.getElementById("input-group").appendChild(placeAutocomplete);

    placeAutocomplete.addEventListener("gmp-select", async ({ placePrediction }) => {
        selectedPlace = placePrediction;
    });
}

// load GeoJSON data for recyclers and manually filter on radius
async function searchGeoJson() {
    await google.maps.importLibrary("geometry");
    clearMarkers();

    // get geojson data
    const [res1, res2] = await Promise.all([
        fetch("src/assets/geojson/MRFs.geojson"),
        fetch("src/assets/geojson/ElectronicsRecyclers.geojson"),
    ]);

    const [geojson1, geojson2] = await Promise.all([
        res1.json(),
        res2.json(),
    ]);

    const combinedGeojson = {
        type: "FeatureCollection",
        features: [...geojson1.features, ...geojson2.features],
    };

    const radius = 30000;

    const bounds = new LatLngBounds();
    combinedGeojson.features.forEach(feature => {
        // create LatLng object for each feature
        const [lng, lat] = feature.geometry.coordinates;
        const point = new google.maps.LatLng(lat, lng);

        // calc distance from searched location
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            searchedLocation,
            point,
        );

        if (distance <= radius) {
            // custom marker for recycling facilities
            const greenPin = new PinElement({
                background: "lightgreen",
                borderColor: "green",
                glyphColor: "green",
            });
            markers.push(new AdvancedMarkerElement({
                map,
                position: point,
                title: feature.properties.Name,
                content: greenPin.element,
            }));
            bounds.extend(point);
        }
    })

    fixBounds(bounds);

    console.log("Found places:", markers);
}

// searches "electronics_stores" within 10km of given location
async function searchLocation() {
    await initMap();

    const request = {
        fields: ["displayName", "location", "businessStatus"],
        locationRestriction: {
            center: searchedLocation,
            radius: 10000,
        },
        includedTypes: ["electronics_store"],
        language: "en-US",
        region: "us",
    };

    clearMarkers();

    const { places } = await Place.searchNearby(request);

    if (places.length) {
        console.log("Found places:", places);

        const bounds = new LatLngBounds();
        places.forEach((place) => {
            markers.push(new AdvancedMarkerElement({
                map,
                position: place.location,
                title: place.displayName,
            }));
            bounds.extend(place.location);
        });

        fixBounds(bounds);
    } else {
        console.log("No results for:", searchedLocation);
    }
}

// textSearch method for "electronics repair"
// range around 20km?
async function searchText(location) {
    const request = {
        locationBias: searchedLocation,
        textQuery: "electronics repair",
        fields: ["displayName", "location", "businessStatus"],
        includedType: "electronics_store",
        language: "en-US",
        region: "us",
    };
    const bannedWords = ["walmart", "staples", "subway", "autozone", "auto parts", "o'reilly", "ace hardware", "home depot", "lowes", "target", "costco", "kroger", "safeway", "aldi", "food lion", "publix"];

    // create feature that will not accept any variations of the words in the bannedWords array

    clearMarkers();

    const { places } = await Place.searchByText(request);

    if (places.length) {
        console.log("Found places:", places);

        const bounds = new LatLngBounds();
        places.forEach((place) => {
            if (!bannedWords.some(word => place.displayName.toLowerCase().includes(word))) {
                markers.push(new AdvancedMarkerElement({
                    map,
                    position: place.location,
                    title: place.displayName,
                }));
                bounds.extend(place.location);
            }
        });

        fixBounds(bounds);
    } else {
        console.log("No results found for:", searchedLocation);
    }
}

// clear old markers
function clearMarkers() {
    markers.forEach((marker) => {
        marker.setMap(null);
    });
    markers = [];
}

// if no markers don't change bounds, and set max zoom
function fixBounds(bounds) {
    if (markers.length > 0) {
        map.fitBounds(bounds);

        const currZoom = map.getZoom();
        const maxZoom = 12;
        if (currZoom > maxZoom) {
            map.setZoom(maxZoom);
        }
    }
}

/*
NOTES:
    Figure out how to switch from SearchBox to Autocomplete since SearchBox isn't allowed for new customers.

    Possibly add more text searches.

    Add "Back" and "Next" buttons to the bottom right to switch back and forth.
    Add search bar on top of map.

SIDEBAR:
    Home is first page
    Nearby Facilities is map
    Asset Data Submission is form
    ESG Dashboard goes next
*/

// Add this script after your form or at the end of your HTML
document.getElementById('btnNext').addEventListener('click', async function() {
    // Only allow proceeding if a place is selected from the dropdown
    if (selectedPlace) {
        const place = selectedPlace.toPlace ? await selectedPlace.toPlace() : selectedPlace;
        await place.fetchFields({ fields: ['location'] });
        searchedLocation = place.location;
        await initMap();
        await searchGeoJson(); // Show nearby facilities (recyclers)
        await searchText();    // Show nearby repair places
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
// <!-- bootstrap js cdn -->
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 