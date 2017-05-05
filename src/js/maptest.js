
(function() {

	'use strict';

	let map;
	let mapAPI;
	let geocoder;
	let infoWindow;
	let poly;
	let places;
	let firebaseRef = firebase.initializeApp({
		apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
		databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
	}).database();

	Polymer({
		is: 'my-locations',
		ready: function() {

			poly = this;
			map = poly.$.map;
			mapAPI = Polymer.dom(poly.root).querySelector('google-maps-api');

			mapAPI.addEventListener('api-load', function(e) {
				geocoder = new mapAPI.api.Geocoder();
				infoWindow = new mapAPI.api.InfoWindow();
				mapAPI.api.event.addListener(map, 'click', function() {
					infoWindow.close();
				});
			});

			poly.latitude = 51.04060;
			poly.longitude = 3.70976;
			poly.zoom = 14;
		},
		submit: function() {

			let name = this.$.name.value;
			let street = this.$.street.value;
			let streetNumber = this.$.streetNumber.value;
			let city = this.$.city.value;
			let isMobile = Polymer.dom(this.root).querySelector('.iron-selected').value;

			// TODO: check for valid input
			addLocation(name, street, streetNumber, city, isMobile);
		}
	});

	let addLocation = function(name, street, streetNumber, city, isMobile) {

		let address = streetNumber + ' ' + street + ', ' + city + ', ' + 'BE';

		geocoder.geocode({'address': address}, function(results, status) {
			if (status === 'OK') {

				let lat = results[0].geometry.location.lat();
				let lng = results[0].geometry.location.lng();

				// center map
				poly.latitude = lat;
				poly.longitude = lng;

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

				// create geofire object with coordinates
				let coordinates =  [lat, lng];
				let firebaseRefLocationsGeo = firebaseRef.ref('locations_geo_test/');
				let geoFire = new GeoFire(firebaseRefLocationsGeo);
				geoFire.set(itemId, coordinates);

			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}

	function deleteLocation(location) {

	};

	function initLocation(location) {

		let fetchedLocation = new Place(location)

	}

	// Class for keeping track of places
	// Renaming class to Location results in errors
	class LocationC {

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

})();
