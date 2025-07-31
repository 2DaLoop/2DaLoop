const { Map } = await google.maps.importLibrary("maps");
const { Place } = await google.maps.importLibrary("places");
const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
const { LatLngBounds, event } = await google.maps.importLibrary("core");
import { navigate } from '../utils/pageRouter.js';

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
    
        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
        placeAutocomplete.id = "place-autocomplete-input";
    
        const recycleBtn = document.createElement("button");
        recycleBtn.textContent = "Recycle";
        recycleBtn.type = "button";
        recycleBtn.classList.add("btn", "btn-light");
        // show navy blue icon of recycling symbol
    
    
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

            sessionStorage.setItem("searchedLocation", JSON.stringify({
                location: place.location
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
    }
}

// load GeoJSON data for recyclers and manually filter on radius
async function searchGeoJson() {
    if (searchedLocation) {
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
    
        const radius = 50000;
    
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
        const bannedWords = ["walmart", "staples", "subway", "autozone", "auto parts", "o'reilly", "ace hardware", "home depot", "lowes", "target", "costco", "kroger", "safeway", "aldi", "food lion", "publix"];
    
        clearMarkers();
    
        const { places } = await Place.searchByText(request);
    
        if (places.length) {
            const bounds = new LatLngBounds();
            let sidebarPlaces = [];
            places.forEach((place) => {
                if (!bannedWords.some(word => place.displayName.toLowerCase().includes(word))) {
                    markers.push(new AdvancedMarkerElement({
                        map,
                        position: place.location,
                        title: place.displayName,
                    }));
                    bounds.extend(place.location);
                    sidebarPlaces.push(place);
                }
            });
    
            fixBounds(bounds);
    
            // Update the sidebar with repair locations
            updateSidebarWithRepairs(sidebarPlaces);
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