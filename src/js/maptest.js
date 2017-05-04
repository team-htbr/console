
(function() {

	'use strict';

	let map;
	let mapAPI;
	let geocoder;
	let infoWindow;
	let firebaseRef = firebase.initializeApp({
		apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
		databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
	}).database();

	Polymer({
		is: 'my-locations',
		ready: function() {

			map = this.$.map;
			mapAPI = Polymer.dom(this.root).querySelector('google-maps-api');

			mapAPI.addEventListener('api-load', function(e) {
				geocoder = new mapAPI.api.Geocoder();
				infoWindow = new mapAPI.api.InfoWindow();
				mapAPI.api.event.addListener(map, 'click', function() {
					infoWindow.close();
				});
			});

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

				// TODO: center map to coordinates

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
	}


})();
