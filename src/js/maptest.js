
(function() {

	'use strict';

	let map;
	let mapAPI;
	let geocoder;
	let infoWindow;
	let poly;
	let locations;
	let locationsList;
	let firebaseRef = firebase.initializeApp({
		apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
		databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
	}).database();

	Polymer({
		is: 'my-locations',
		ready: function() {

			poly = this;
			locations = [];
			locationsList = [];
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
			poly.items = [];

			listenForChanges();

			console.log(locations);
		},
		submit: function() {

			let name = this.$.name.value;
			let street = this.$.street.value;
			let streetNumber = this.$.streetNumber.value;
			let city = this.$.city.value;
			let isMobile = Polymer.dom(this.root).querySelector('.iron-selected').value;

			// TODO: check for valid input
			addLocation(name, street, streetNumber, city, isMobile);
		},
		clicked: function(e, detail, sender) {
			console.log('marker clicked');
		},
		properties: {
			activeItem: {
				observer: '_activeItemChanged'
			}
        },
		_onActiveItemChanged: function(e) {
          	this.$.grid.expandedItems = [e.detail.value];
        },
        _activeItemChanged: function(item) {
			this.$.grid.selectedItems = item ? [item] : [];
			if(item != null) {
				console.log(item.id);
				console.log(poly.items.find(x => x.id == item.id));
				console.log(map);
				console.log(poly.$);
			}
        },
		_removeLocation: function(e) {
			let item = e.model.item;
			if(item != null) {
				console.log(item.id);
				firebaseRef.ref('locations_test').child(item.id).remove();
				firebaseRef.ref('locations_geo_test').child(item.id).remove();
			}
		},
		_editLocation: function(e) {
			let body = document.querySelector('body');
			console.log(body);
			poly.$.dialog.open();
			let item = e.model.item;
			if(item != null) {
				console.log(item.id);
			}
		}
	});

	function addLocation(name, street, streetNumber, city, isMobile) {

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

	function removeLocation(location) {
		// TODO: delete index of location as well
		delete locations[location.id];
	};

	function listenForChanges() {

		let locationsDb = firebaseRef.ref('locations_test');

		locationsDb.on('child_added', function(fetchedLocation) {
			console.log('added');

			let newLocation = initLocation(fetchedLocation.val());

			renderMarker(newLocation.getMarker());
			poly.push('items', newLocation);
			poly.$.grid.clearCache();
		});

		locationsDb.on('child_removed', function(fetchedLocation) {
			console.log('removed');

			let removedLocation = locations[fetchedLocation.val().id];

			poly.splice('items', indexOf(poly.items, removedLocation.id), 1);
			poly.$.grid.clearCache();
			removeMarker(removedLocation.getMarker());
			removeLocation(removedLocation);
		});

		locationsDb.on('child_changed', function(fetchedLocation) {
			console.log('changed');

			let oldLocation = locations[fetchedLocation.val().id]
			let updatedLocation = initLocation(fetchedLocation.val());

			poly.splice('items', indexOf(poly.items, oldLocation.id), 1);
			poly.push('items', updatedLocation);
			poly.$.grid.clearCache();

			removeMarker(oldLocation.getMarker());
			renderMarker(updatedLocation.getMarker());
		});

		locationsDb.on('child_moved', function(fetchedLocation) {

		});
	}

	function initLocation(fetchedLocation) {

		let newLocation = new Location(fetchedLocation.id, fetchedLocation.name, fetchedLocation.street,
		 fetchedLocation.streetNumber, fetchedLocation.city, fetchedLocation.lat, fetchedLocation.lng, fetchedLocation.isMobile);

		locations[fetchedLocation.id] = newLocation;

		return newLocation;
	}

	// Render a marker on a map
	// If marker already exists, remove the marker and replace it with new marker
	function renderMarker(marker) {
		poly.$.map.appendChild(marker);
	}

	function removeMarker(marker) {
		poly.$.map.removeChild(marker);
	}

	function indexOf(array, id) {
		for (var i = 0; i < array.length; i++) {
			if (array[i].id === id) return i;
		}
		return -1;
	}

	// Class for keeping track of places
	// Renaming class to Location results in errors
	class Location {

		constructor(id, name, street, streetNumber, city, lat, lng, isMobile) {
			this.id = id;
			this.name = name;
			this.street = street;
			this.streetNumber = streetNumber;
			this.city = city;
			this.lat = lat;
			this.lng = lng;
			this.isMobile = isMobile;
			this.marker = document.createElement('google-map-marker');
		}

		getInfoWindowContent() {
			return '<h3>' + this.name + '</h3>'
				+ '<p>' + this.street + ' ' + this.streetNumber + ', ' + this.city + '</p>';
		}

		getMarker() {
			// this.marker.setAttribute('click-events', true);
			// this.marker.setAttribute('google-map-marker-click');
			this.marker.setAttribute('latitude', this.lat);
			this.marker.setAttribute('longitude', this.lng);
			this.marker.setAttribute('title', this.name);
			this.marker.setAttribute('id', this.id);
			this.marker.innerHTML = this.getInfoWindowContent();

			return this.marker;
		}

	};

})();
