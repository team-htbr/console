
(function() {

	'use strict';

	let map;
	let mapAPI;
	let geocoder;
	let infoWindow;
	let poly;
	let locations;
	let firebaseRef = firebase.initializeApp({
		apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
		databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
	}).database();

	Polymer({
		is: 'my-locations',
		ready: function() {

			poly = this;
			locations = [];
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

			listenForChanges();
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

		// check if address is valid and get its coordinates if so
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

				// add geofire object to database
				let coordinates =  [lat, lng];
				let geoFire = new GeoFire(firebaseRef.ref('locations_geo_test/'));
				geoFire.set(itemId, coordinates);

			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}

	function deleteLocation(location) {

	};

	function listenForChanges() {

		let locationsDb = firebaseRef.ref('locations_test');

		locationsDb.on('child_added', function(fetchedLocation) {
			initLocation(fetchedLocation.val());
		});

		locationsDb.on('child_removed', function(fetchedLocation) {

		});

		locationsDb.on('child_changed', function(fetchedLocation) {

		});

		locationsDb.on('child_moved', function(fetchedLocation) {

		});

		console.log(locations);
	}

	function initLocation(fetchedLocation) {

		let newLocation = new Place(fetchedLocation.id, fetchedLocation.name, fetchedLocation.street,
			fetchedLocation.city, fetchedLocation.lat, fetchedLocation.lng, fetchedLocation.isMobile);

		locations[fetchedLocation.id] = newLocation;
	}


	// Class for keeping track of places
	// Renaming class to Location results in errors
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

})();
