(function() {

    'use strict';

	var map;
	var marker;
	var infoWindow;

	// Initialize the Firebase SDK
	firebase.initializeApp({
		apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
		databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
	});

	// Generate a reference to path in database
	// var firebaseRefLocations = firebase.database().ref('locations');
	var firebaseRefLocationsGeo = firebase.database().ref('locations_geo');

	// Create a new GeoFire instance at the Firebase location
	var geoFire = new GeoFire(firebaseRefLocationsGeo);

	function initMap() {
		var gent = {lat: 51.046238, lng: 3.714628};

		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 14,
			center: gent,
			title: 'This is a title'
		});

		console.log(map);

		marker = new google.maps.Marker({
			map: map,
			title: 'is is a title'
		});

		infoWindow = new google.maps.InfoWindow({
			content: 'This is content for the infoWindow'
		});

		map.addListener('click', function(event) {
			changeMarker(event.latLng);
		});

		marker.addListener('click', function() {
			infoWindow.open(map, marker);
		});
	}

	// Adds a marker to the map and push to the array.
	function changeMarker(location) {
		marker.setPosition(location);
		console.log(marker.getPosition());
		var lat = marker.getPosition().lat();
		var lng = marker.getPosition().lng();
		document.getElementById('flat').value = lat;
		document.getElementById('flng').value = lng;
		var locationId = lat.toFixed(5).toString().replace('.', '');
		var location =  [lat, lng];
		console.log(location);
		geoFire.set('location' + locationId, location);
	}

})();
