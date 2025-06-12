const { Map } = await google.maps.importLibrary("maps");
const { Place, SearchBox } = await google.maps.importLibrary("places");
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
const { LatLngBounds, event } = await google.maps.importLibrary("core");

const centerPosition = { lat: 39.8283, lng: -98.5795 }; // Geographic center of continental U.S.
let map;
let markers = [];

initAutoComplete();

// search based on current location
document.getElementById("btnCurrLocation").addEventListener("click", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function (location) {
                const userLocation = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                };

                await searchLocation(userLocation);
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

document.getElementById("location-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
    }
});

// initialize map centered on the U.S.
async function initMap() {
    const content = document.querySelector(".main-content")
    content.innerHTML = `<div id="map" style="height: 100%; width: 100%;"></div>`;

    map = new Map(document.getElementById("map"), {
        center: centerPosition,
        zoom: 4,
        mapId: "e8f578253d8c676318b940c1-",
    });
}

// initialize autocomplete search box
function initAutoComplete() {
    const input = document.getElementById("location-input");
    const searchBox = new SearchBox(input);

    // listener for searching a different location
    event.addListener(searchBox, "places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // when clicking "Next", search for that location
        document.getElementById("btnNext").addEventListener("click", async () => {
            places.forEach(async (place) => {
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }

                await searchLocation(place.geometry.location);
            });
        });
    });
}

// load GeoJSON data
// can't use google maps api to filter this data based on location and radius, have to do manually
async function initGeoJson() {
    map.data.loadGeoJson("src/assets/geojson/MRFs.geojson");
    map.data.loadGeoJson("src/assets/geojson/ElectronicsRecyclers.geojson");

    // Optional styling for GeoJSON features
    map.data.setStyle({
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
    });
}

// searches "electronics_stores" within 10km of given location
async function searchLocation(location) {
    await initMap();

    const request = {
        fields: ["displayName", "location", "businessStatus"],
        locationRestriction: {
            center: location,
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

        map.fitBounds(bounds);
    } else {
        console.log("No results for:", location);
    }
}

// example of textSearch method
async function performTextSearch(query, includedType) {
    const request = {
        textQuery: query,
        fields: ["displayName", "location", "businessStatus"],
        includedType,
        language: "en-US",
        region: "us",
        useStrictTypeFiltering: false,
    };

    clearMarkers();

    const { places } = await Place.searchByText(request);

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

        map.fitBounds(bounds);
    } else {
        console.log("No results found for:", query);
    }
}

// clear old markers
function clearMarkers() {
    markers.forEach((marker) => {
        marker.setMap(null);
    });
    markers = [];
}

/*
NOTES:

    Either figure out how to search all the facilities we need to show on the map
    or use GeoJSON data and manually filter.
    Or both??
    For first option, we'd have to use the textSearch method for all places that might be relevant.

*/
