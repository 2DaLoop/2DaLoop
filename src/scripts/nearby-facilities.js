const { Map } = await google.maps.importLibrary("maps");
const { Place } = await google.maps.importLibrary("places");
const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
const { LatLngBounds, event } = await google.maps.importLibrary("core");
import { navigate } from '/utils/pageRouter.js';

const centerPosition = { lat: 39.8283, lng: -98.5795 }; // Geographic center of continental U.S.
let searchedLocation = JSON.parse(sessionStorage.getItem("searchedLocation")) || null;
let map;
let markers = [];
let selectedPlace = null;

initMap();
if (searchedLocation) {
    searchedLocation = searchedLocation.location
    searchText();
}

document.querySelector('#next-btn').addEventListener('click', async () => {
    navigate('#/asset-submission')
})

// initialize map centered on the U.S.
async function initMap() {
    const mapDiv = document.getElementById("map")
    if (mapDiv) {
        map = new Map(mapDiv, {
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
        // Make the optionsDiv a horizontal flex container
        optionsDiv.style.display = "flex";
        optionsDiv.style.flexDirection = "row";
        optionsDiv.style.alignItems = "center";
        optionsDiv.style.gap = "12px"; // space between elements
    
        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
        placeAutocomplete.id = "place-autocomplete-input";
    
        const recycleBtn = document.createElement("button");
        recycleBtn.type = "button";
        recycleBtn.classList.add("btn", "recycle-button");
        // Add a small recycle SVG icon before the text
        recycleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-recycle" viewBox="0 0 16 16">
                <path d="M9.302 1.256a1.5 1.5 0 0 0-2.604 0l-1.704 2.98a.5.5 0 0 0 .869.497l1.703-2.981a.5.5 0 0 1 .868 0l2.54 4.444-1.256-.337a.5.5 0 1 0-.26.966l2.415.647a.5.5 0 0 0 .613-.353l.647-2.415a.5.5 0 1 0-.966-.259l-.333 1.242zM2.973 7.773l-1.255.337a.5.5 0 1 1-.26-.966l2.416-.647a.5.5 0 0 1 .612.353l.647 2.415a.5.5 0 0 1-.966.259l-.333-1.242-2.545 4.454a.5.5 0 0 0 .434.748H5a.5.5 0 0 1 0 1H1.723A1.5 1.5 0 0 1 .421 12.24zm10.89 1.463a.5.5 0 1 0-.868.496l1.716 3.004a.5.5 0 0 1-.434.748h-5.57l.647-.646a.5.5 0 1 0-.708-.707l-1.5 1.5a.5.5 0 0 0 0 .707l1.5 1.5a.5.5 0 1 0 .708-.707l-.647-.647h5.57a1.5 1.5 0 0 0 1.302-2.244z"/>
            </svg>
            Recycle
        `;
    
        const repairBtn = document.createElement("button");
        repairBtn.type = "button";
        repairBtn.classList.add("btn", "repair-button");
        // Add a small repair (wrench) SVG icon before the text
        repairBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tools" viewBox="0 0 16 16">
                <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.68-2.643A3.005 3.005 0 0 0 16 3q0-.405-.102-.777l-2.14 2.141L12 4l-.364-1.757L13.777.102a3 3 0 0 0-3.675 3.68L7.462 6.46 4.793 3.793a1 1 0 0 1-.293-.707v-.071a1 1 0 0 0-.419-.814zm9.646 10.646a.5.5 0 0 1 .708 0l2.914 2.915a.5.5 0 0 1-.707.707l-2.915-2.914a.5.5 0 0 1 0-.708M3 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z"/>
            </svg>
            Repair
        `;
    
        const r2Btn = document.createElement("button");
        r2Btn.type = "button";
        r2Btn.classList.add("btn", "r2-button");
        // Style the R2 button with the nav bar blue color
        r2Btn.style.background = "#3766A5";
        r2Btn.style.color = "#fff";
        r2Btn.style.border = "none";
        r2Btn.style.fontWeight = "bold";
        r2Btn.style.letterSpacing = "1px";
        r2Btn.style.padding = "8px 18px";
        r2Btn.style.borderRadius = "6px";
        // Add a certificate SVG icon before the text
        r2Btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-leaf" viewBox="0 0 16 16">
            <path d="M1.4 1.7c.216.289.65.84 1.725 1.274 1.093.44 2.884.774 5.834.528l.37-.023c1.823-.06 3.117.598 3.956 1.579C14.16 6.082 14.5 7.41 14.5 8.5c0 .58-.032 1.285-.229 1.997q.198.248.382.54c.756 1.2 1.19 2.563 1.348 3.966a1 1 0 0 1-1.98.198c-.13-.97-.397-1.913-.868-2.77C12.173 13.386 10.565 14 8 14c-1.854 0-3.32-.544-4.45-1.435-1.125-.887-1.89-2.095-2.391-3.383C.16 6.62.16 3.646.509 1.902L.73.806zm-.05 1.39c-.146 1.609-.008 3.809.74 5.728.457 1.17 1.13 2.213 2.079 2.961.942.744 2.185 1.22 3.83 1.221 2.588 0 3.91-.66 4.609-1.445-1.789-2.46-4.121-1.213-6.342-2.68-.74-.488-1.735-1.323-1.844-2.308-.023-.214.237-.274.38-.112 1.4 1.6 3.573 1.757 5.59 2.045 1.227.215 2.21.526 3.033 1.158.058-.39.075-.782.075-1.158 0-.91-.288-1.988-.975-2.792-.626-.732-1.622-1.281-3.167-1.229l-.316.02c-3.05.253-5.01-.08-6.291-.598a5.3 5.3 0 0 1-1.4-.811"/>
            </svg>
            R2 & RIOS
        `;
    
        // Insert the R2 button next to the other buttons
        optionsDiv.append(placeAutocomplete, repairBtn, recycleBtn, r2Btn);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(optionsDiv);
    
        // listeners for search input and filter options
        placeAutocomplete.addEventListener("gmp-select", async ({ placePrediction }) => {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ['location', 'formattedAddress'] });

            sessionStorage.setItem("searchedLocation", JSON.stringify({
                location: place.location,
                address: place.formattedAddress
            }));

            searchedLocation = place.location;
            await searchText();
        });
    
        recycleBtn.addEventListener("click", async () => {
            await searchGeoJson();
        });
    
        repairBtn.addEventListener("click", async () => {
            await searchText();
        });
    
        r2Btn.addEventListener("click", () => {
            Swal.fire({
                title: "Coming Soon",
                text: "R2 & RIOS certified facility search will be available in a future update.",
                confirmButtonText: "OK",
                confirmButtonColor: "#3766A5"
            });
        });
    }

    // Responsive: stack buttons vertically under search bar on medium/small screens
    const responsiveStyleId = 'search-bar-buttons-responsive-style';
    if (!document.getElementById(responsiveStyleId)) {
        const style = document.createElement('style');
        style.id = responsiveStyleId;
        style.innerHTML = `
            .card.card-body.gap-2 {
                width: 100% !important;
                box-sizing: border-box !important;
            }
            .card.card-body.gap-2 > * {
                min-width: 0 !important;
            }
            @media (max-width: 900px) {
                .card.card-body.gap-2 {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    gap: 10px !important;
                    width: 100% !important;
                }
                .card.card-body.gap-2 > * {
                    width: 100% !important;
                    min-width: 0 !important;
                    box-sizing: border-box !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add this helper function near the top of your file
function showHoverPopup({ name, displayName, address, formattedAddress }) {
    // Remove any existing popup
    let existing = document.getElementById('hover-location-popup');
    if (existing) existing.remove();

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'hover-location-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#fff';
    popup.style.border = '2px solid #3766A5';
    popup.style.borderRadius = '16px';
    popup.style.boxShadow = '0 4px 24px rgba(55,102,165,0.18)';
    popup.style.padding = '28px 24px';
    popup.style.zIndex = '20000';
    popup.style.minWidth = '220px';
    popup.style.maxWidth = '90vw';
    popup.style.textAlign = 'center';
    popup.style.pointerEvents = 'none'; // So it doesn't block map interaction

    popup.innerHTML = `
        <strong style="font-size:20px;color:#3766A5;">${displayName || name || 'Unknown'}</strong><br>
        <span style="font-size:16px;">${formattedAddress || address || ''}</span>
    `;

    document.body.appendChild(popup);
}

// Remove popup on mouseout
function removeHoverPopup() {
    let existing = document.getElementById('hover-location-popup');
    if (existing) existing.remove();
}

// load GeoJSON data for recyclers and manually filter on radius
async function searchGeoJson() {
    if (searchedLocation) {
        await google.maps.importLibrary("geometry");
        clearMarkers();

        // get geojson data
        const [res1, res2] = await Promise.all([
            fetch("/assets/geojson/MRFs.geojson"),
            fetch("/assets/geojson/ElectronicsRecyclers.geojson"),
        ]);

        const [geojson1, geojson2] = await Promise.all([
            res1.json(),
            res2.json(),
        ]);

        const combinedGeojson = {
            type: "FeatureCollection",
            features: [...geojson1.features, ...geojson2.features],
        };

        const radius = 50000;

        const bounds = new LatLngBounds();
        const sidebarFacilities = [];
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
                const marker = new AdvancedMarkerElement({
                    map,
                    position: point,
                    title: feature.properties.Name,
                    content: greenPin.element,
                });
                markers.push(marker);
                bounds.extend(point);

                // --- Use element.addEventListener for hover popup ---
                marker.element.addEventListener('mouseenter', () => {
                    showHoverPopup({
                        name: feature.properties.Name,
                        address: feature.properties.Address
                    });
                });
                marker.element.addEventListener('mouseleave', removeHoverPopup);
                // Add for touch/click (mobile/tablet)
                marker.element.addEventListener('touchstart', (e) => {
                    showHoverPopup({
                        name: feature.properties.Name,
                        address: feature.properties.Address
                    });
                    e.preventDefault();
                });
                marker.element.addEventListener('touchend', removeHoverPopup);
                marker.element.addEventListener('click', () => {
                    showHoverPopup({
                        name: feature.properties.Name,
                        address: feature.properties.Address
                    });
                });
            }
        });

        fixBounds(bounds);
    }
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
    if (searchedLocation) {
        const request = {
            locationBias: searchedLocation,
            textQuery: "electronics repair",
            fields: ["displayName", "location", "businessStatus", "formattedAddress"],
            includedType: "electronics_store",
            language: "en-US",
            region: "us",
        };
        const bannedWords = ["walmart", "staples", "subway", "autozone", "auto parts", "o'reilly", "ace hardware", "home depot", "lowes", "target", "costco", "kroger", "safeway", "aldi", "food lion", "publix", "best buy", "fedex"];
    
        clearMarkers();
    
        const { places } = await Place.searchByText(request);
    
        if (places.length) {
            const bounds = new LatLngBounds();
            let sidebarPlaces = [];
            places.forEach((place) => {
                if (!bannedWords.some(word => place.displayName.toLowerCase().includes(word))) {
                    const marker = new AdvancedMarkerElement({
                        map,
                        position: place.location,
                        title: place.displayName,
                    });
                    markers.push(marker);
                    bounds.extend(place.location);

                    // Add hover event for repair pins
                    marker.element.addEventListener('mouseenter', () => {
                        showHoverPopup({
                            displayName: place.displayName,
                            formattedAddress: place.formattedAddress
                        });
                    });
                    marker.element.addEventListener('mouseleave', removeHoverPopup);
                    // Add for touch/click (mobile/tablet)
                    marker.element.addEventListener('touchstart', (e) => {
                        showHoverPopup({
                            displayName: place.displayName,
                            formattedAddress: place.formattedAddress
                        });
                        // Prevent simulated mouse events
                        e.preventDefault();
                    });
                    marker.element.addEventListener('touchend', removeHoverPopup);
                    marker.element.addEventListener('click', () => {
                        showHoverPopup({
                            displayName: place.displayName,
                            formattedAddress: place.formattedAddress
                        });
                    });
                }
            });
    
            fixBounds(bounds);

        } else {
            // Clear sidebar if no results
            updateSidebarWithRepairs([]);
            console.log("No results found for:", searchedLocation);
        }
    }
}

// Helper to update the sidebar with repair locations
function updateSidebarWithRepairs(places) {
    const sidebar = document.getElementById('facilities-list');
    if (!sidebar) return;

    // Set the sidebar title to "Repair"
    let title = sidebar.querySelector('h3');
    if (!title) {
        title = document.createElement('h3');
        sidebar.prepend(title);
    }
    title.textContent = 'Repair';

    // Get the list container or create it
    let list = document.getElementById('facility-items');
    if (!list) {
        list = document.createElement('ul');
        list.id = 'facility-items';
        list.style.listStyle = 'none';
        list.style.padding = '0';
        list.style.margin = '0';
        sidebar.appendChild(list);
    }
    list.innerHTML = '';

    // Add each place as a card with all available info from the pin
    places.forEach((place, i) => {
        const li = document.createElement('li');
        li.style.padding = '16px';
        li.style.marginBottom = '16px';
        li.style.borderRadius = '12px';
        li.style.background = '#fff';
        li.style.boxShadow = '0 2px 8px rgba(55,102,165,0.08)';
        li.style.border = '1px solid #e0e6ed';
        li.style.cursor = 'pointer';

        li.innerHTML = `
            <strong style="font-size:18px;color:#3766A5;">${place.displayName || 'Unknown'}</strong><br>
            <span style="font-size:15px;">${place.formattedAddress || ''}</span><br>
            <span style="font-size:15px;">Status: ${place.businessStatus || 'N/A'}</span><br>
            ${place.phoneNumber ? `<span style="font-size:15px;">Phone: ${place.phoneNumber}</span><br>` : ''}
            ${place.websiteUri ? `<a href="${place.websiteUri}" target="_blank" style="color:#3766A5;">Website</a><br>` : ''}
        `;

        li.onclick = function () {
            // Center map on this marker if available
            if (markers[i]) {
                map.panTo(markers[i].position);
                map.setZoom(15);
                // Optionally, add a highlight effect
                markers[i].element.style.filter = 'drop-shadow(0 0 8px #3766A5)';
                setTimeout(() => {
                    markers[i].element.style.filter = '';
                }, 1200);
            }
        };

        list.appendChild(li);
    });
}

// Helper to update the sidebar with recycle locations
function updateSidebarWithRecyclers(facilities) {
    const sidebar = document.getElementById('facilities-list');
    if (!sidebar) return;

    // Set the sidebar title to "Recycle"
    let title = sidebar.querySelector('h3');
    if (!title) {
        title = document.createElement('h3');
        sidebar.prepend(title);
    }
    title.textContent = 'Recycle';

    
    // Add each facility as a card
    facilities.forEach((facility) => {
        const li = document.createElement('li');
        li.style.padding = '16px';
        li.style.marginBottom = '16px';
        li.style.borderRadius = '12px';
        li.style.background = '#fff';
        li.style.boxShadow = '0 2px 8px rgba(55,102,165,0.08)';
        li.style.border = '1px solid #e0e6ed';
        li.style.cursor = 'pointer';

        li.innerHTML = `
            <strong style="font-size:18px;color:#3766A5;">${facility.name || 'Unknown'}</strong><br>
            <span style="font-size:15px;">${facility.address || ''}</span><br>
            ${facility.phone ? `<span style="font-size:15px;">Phone: ${facility.phone}</span><br>` : ''}
            ${facility.hours ? `<span style="font-size:15px;">Hours: ${facility.hours}</span><br>` : ''}
        `;
    });

    // Center and fit the map to show all recycling pins
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => {
            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);

        // Optionally, set a max zoom so it's not too close if pins are clustered
        const currZoom = map.getZoom();
        const maxZoom = 12;
        if (currZoom > maxZoom) {
            map.setZoom(maxZoom);
        }
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