/**
 * Script location functionality
 */

'use strict';

Polymer({
	is: 'my-locations',
});

/**
 * Load the Google Maps api async
 */
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelectorAll('#map').length > 0) {
		console.log('yes');
        let jsFile = document.createElement('script');
        jsFile.type = 'text/javascript';
        jsFile.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio&callback=initMap';
        document.getElementsByTagName('head')[0].appendChild(jsFile);
    }
});

/**
 * Initialise global properties
 */

var firebaseRef = firebase.initializeApp({
    apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
    databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
}).database();

var geocoder;
var infoWindow;
var map;

/**
 * Initialise map and all its features
 */
function initMap() {

    // Initialise map and center it to x location
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: { lat: 51.04060 , lng: 3.70976 }
    });

	geocoder = new google.maps.Geocoder();
	infoWindow = new google.maps.InfoWindow();

    // Initialise only one infoWindow at a time


    document.getElementById('locationBtn').onclick = function () {
        // Location object
        let name = document.getElementById('locationName').value;
        let street = document.getElementById('locationStreet').value;
        let streetNumber = document.getElementById('locationStreetNumber').value;
        let city = document.getElementById('locationCity').value;
        let isMobile = false;

        addLocation(geocoder, name, street, streetNumber, city, isMobile);
    }

    google.maps.event.addListener(map, 'click', function() {
        infoWindow.close();
    });

    renderMarkers();

    testLocationClass();
};

// Add a location to the database
let addLocation = function(name, street, streetNumber, city, isMobile) {

    let address = streetNumber + ' ' + street + ', ' + city + ', ' + 'BE';

    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);

            let lat = results[0].geometry.location.lat();
            let lng = results[0].geometry.location.lng();

            // add location to database
            let itemId = firebaseRef.ref('loacations_test').push().getKey();
            firebaseRef.ref('locations_test').child(itemId).set({
                id: itemId,
                name: name,
                street: street,
                streetNumber: streetNumber,
                city: city,
                isMobile: isMobile,
                lat: lat,
                lng: lng
            });

            // add location to geofire
            let location =  [lat, lng];
            let firebaseRefLocationsGeo = firebaseRef.ref('locations_geo_test/' + itemId);
            let geoFire = new GeoFire(firebaseRefLocationsGeo);
            geoFire.set('location', location);

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
};

function deleteLocation() {

};

function renderMarkers() {

    let locations = firebaseRef.ref('locations_test');

    locations.on('child_added', function(location) {
        renderMarker(location);
    });

    locations.on('child_removed', function(location) {

    });

    locations.on('child_changed', function(location) {

    });

    locations.on('child_moved', function(location) {

    });
};

let renderMarker = function(location) {

    let marker = new google.maps.Marker({
        position: { lat:  location.val().lat, lng: location.val().lng },
        map: map
    });

    let name = '<h3>' + location.val().name + '</h3>';
    let address = '<p>' + location.val().street + ' ' + location.val().streetNumber + ', ' + location.val().city + '</p>';
    let content = name + address;

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(content);
        infoWindow.open(resultsMap, marker);
    });
}


let testLocationClass = function() {

    let locations = firebaseRef.ref('locations_test');

    locations.on('child_added', function(l) {
		let id = l.val().id;
		let name = l.val().name;
		let street = l.val().street;
		let streetNumber = l.val().streetNumber;
		let city = l.val().city;
		let lat = l.val().lat;
		let lng = l.val().lng;
		let isMobile = l.val().isMobile;
		let test1 = new Place(id, name, street, streetNumber, city, lat, lng, isMobile);
		console.log(test1);
    });
}

let removeMarker = function(resultsMap, location) {

};


// Class for keeping track of places
class Place {

	constructor(id, name, street, streetNumber, city, lat, lng, isMobile) {
		this.id = id;
		this.name = name;
		this.street = street;
		this.streetNumber = streetNumber;
		this.city = city;
		this.lat = lat;
		this.lng = lng;
		this.isMobile = isMobile;
		this.marker;
	}

	getInfoWindowContent() {
		return '<h3>' + this.name + '</h3>'
			+ '<p>' + this.street + ' ' + this.streetNumber + ', ' + this.city + '</p>';
	}

	getMarker() {
		return this.marker;
	}

	setMarker(marker) {
		this.marker = marker;
	}

};





