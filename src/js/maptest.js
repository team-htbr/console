
(function() {

	'use strict';

	let map;
	let mapAPI;
	let geocoder;
	let infoWindow;
	let poly;
	let locations;
	let toastContainer;
	let toastSuccess;
	let toastFail;
	let toastIncomplete;
	let dateContainer;
	let startDatePicker;
	let endDatePicker;
	let startDate;
	let endDate;
	let form;
	let submitBtn;
	let firebaseRef = firebase.initializeApp({
		apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
		databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
	}).database();

	Polymer({
		is: 'my-locations',
		ready: function() {

			toastContainer = this.$.toastContainer;
			toastSuccess = this.$.toastSuccess;
			dateContainer = this.$$('.dateContainer');
			startDatePicker = this.$.startDatePicker;
			endDatePicker = this.$.endDatePicker;
			form = this.$.locationForm;
			submitBtn = this.$.locationBtn;

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

			addLocation(name, street, streetNumber, city, isMobile, startDate, endDate);
		},
		_on_tap_mobile: function() {
			dateContainer.style.display = "flex";
			startDate = startDatePicker.value || "";
			endDate = endDatePicker.value || "";
			if ((startDate == "") || (endDate == "")) {
				submitBtn.disabled = true;
			}
		},
		_on_tap_fixed: function() {
			dateContainer.style.display = "none";
			submitBtn.disabled = !form.validate();
		}
	});

	let addLocation = function(name, street, streetNumber, city, isMobile, startDate, endDate) {

		if (name && street && streetNumber && city) {
			/*if (isMobile == true && (!startDate || !endDate)) {
				toastIncomplete.fitInto = toastContainer;
				toastIncomplete.open();
			}*/

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
					toastSuccess.fitInto = toastContainer;
					toastSuccess.open();

				}
			});
		}
		
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
		});

		locationsDb.on('child_removed', function(fetchedLocation) {
			console.log('removed');

			let removedMarker = locations[fetchedLocation.val().id];

			removeMarker(removedMarker.getMarker());
			removeLocation(removedMarker);
		});

		locationsDb.on('child_changed', function(fetchedLocation) {
			console.log('changed');

			let oldLocation = locations[fetchedLocation.val().id]
			let updatedLocation = initLocation(fetchedLocation.val());

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

	// Class for keeping track of places
	// Renaming class to Location results in errors
	class Location {

		constructor(id, name, street, streetNumber, city, lat, lng, isMobile, startDate, endDate) {
			this.id = id;
			this.name = name;
			this.street = street;
			this.streetNumber = streetNumber;
			this.city = city;
			this.lat = lat;
			this.lng = lng;
			this.isMobile = isMobile;
			this.startDate = "not defined";
			this.endDate = "not defined";
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
			this.marker.innerHTML = this.getInfoWindowContent();

			return this.marker;
		}

	};

	form.addEventListener('input', function(event) {
		// Validate the entire form to see if the `Submit` button should be enabled.
		submitBtn.disabled = !form.validate();
	});

	startDatePicker.addEventListener('value-changed', function(event) {
		startDate = startDatePicker.value || "";
		if ((startDate !== "") && (endDate !== "")) {
			submitBtn.disabled = false;
		}
	});

	endDatePicker.addEventListener('value-changed', function(event) {
		endDate = endDatePicker.value || "";
		if ((startDate !== "") && (endDate !== "")) {
			submitBtn.disabled = false;
		}
	});

})();