
(function() {

	'use strict';

	let map;
	let mapAPI;
	let geocoder;
	let infoWindow;
	let poly;
	let locations;
	let locationsList;
	let toastContainer;
	let toastSuccess;
	let toastFail;
	let toastIncomplete;
	let submitBtn;
	let firebaseRef;
	let editLocation;

	Polymer({
		is: 'my-locations',
		ready: function() {

			firebaseRef = firebase.initializeApp({
				apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
				databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
			}).database();
			toastContainer = this.$.toastContainer;
			toastSuccess = this.$.toastSuccess;
			poly = this;
			locations = [];
			locationsList = [];
			map = poly.$.map;
			mapAPI = Polymer.dom(poly.root).querySelector('google-maps-api');

			this.addEventListener('eventFromChild', this._submit);
			mapAPI.addEventListener('api-load', function(e) {
				geocoder = new mapAPI.api.Geocoder();
				infoWindow = new mapAPI.api.InfoWindow();
				mapAPI.api.event.addListener(map, 'click', function() {
					infoWindow.close();
				});
			});

			poly.latitude = 51.04060;
			poly.longitude = 3.70976;
			poly.zoom = 9;
			poly.items = [];

			listenForChanges();
		},
		properties: {
			activeItem: {
				observer: '_activeItemChanged'
			}
        },
		_createLocation: function() {
			let test = new Location('new', 'Nieuwe locatie');
			this.unshift('items', test);
			this.$.grid.expandedItems = [test];
			this.$.grid.selectedItems = test ? [test] : [];
			let length = this.$.grid.querySelectorAll('#' + test.id).length;
			this.$.grid.querySelectorAll('#' + test.id)[length - 1].innerHTML = '<my-location-form id="form' + test.id + '"></my-location-form>';
			editLocation = test;
		},
		_removeLocation: function(e) {
			let item = e.model.item;
			if(item != null) {
				if(item.id == 'new') {
					this.shift('items');
				} else {
					firebaseRef.ref('locations').child(item.id).remove();
				}
			}
		},
		_editLocation: function(e) {
			let unfinishedLocation = this.items;
			if(unfinishedLocation != null && unfinishedLocation[0].id == 'new' && e.model.item != unfinishedLocation[0]) {
				this.shift('items');
			}
			this.$.grid.selectedItems = e.model.item ? [e.model.item] : [];
			this.$.grid.expandedItems = [e.model.item];
			editLocation = e.model.item;
			this.$.grid.querySelector('#' + e.model.item.id).innerHTML = '<my-location-form id="form' + e.model.item.id + '"></my-location-form>';
			let form = this.$.grid.querySelector('#form' + editLocation.id);
			form.$.name.value = editLocation.name;
			form.$.street.value = editLocation.street;
			form.$.streetNumber.value = editLocation.streetNumber;
			form.$.city.value = editLocation.city;
			form.$.startDatePicker.value = editLocation.startDate;
			form.$.endDatePicker.value = editLocation.endDate;
		},
		_submit: function(event) {
			if(editLocation !== null) {
				let form = this.$.grid.querySelector('#form' + editLocation.id);
				let name = form.$.name.value;
				let street = form.$.street.value;
				let streetNumber = form.$.streetNumber.value;
				let city = form.$.city.value;
				let isMobile = form.root.querySelector('.iron-selected').value;
				let startDate = form.$.startDatePicker.value;
				let endDate = form.$.endDatePicker.value;
				addLocation(name, street, streetNumber, city, isMobile, startDate, endDate);
				this.$.grid.selectedItems = [];
				this.$.grid.expandedItems = [];
				if (editLocation.id == 'new') {
					this.shift('items');
				}
			}
		},
		_activeItemChanged: function(item) {
			this.$.grid.selectedItems = item ? [item] : [];
			if(item != null) {
				// console.log(item.id);
				// console.log(poly.items.find(x => x.id == item.id));
			}
        },
		_onActiveItemChanged: function(e) {
          	this.$.grid.expandedItems = [e.detail.value];
			let unfinishedLocation = this.items;
			if(unfinishedLocation != null) {
				if(unfinishedLocation[0].id == 'new' && e.detail.value != unfinishedLocation[0]) {
					this.shift('items');
				}
			}
        }
	});

	let addLocation = function(name, street, streetNumber, city, isMobile, startDate, endDate) {
		if (name && street && streetNumber && city) {
			let address = streetNumber + ' ' + street + ', ' + city + ', ' + 'BE';

			// check if address is valid and get its coordinates if so
			geocoder.geocode({'address': address}, function(results, status) {
				if (status === 'OK') {

					let lat = results[0].geometry.location.lat();
					let lng = results[0].geometry.location.lng();

					// center map
					poly.latitude = lat;
					poly.longitude = lng;

					let itemId;
					let exist;
					// add location to database
					firebaseRef.ref('locations').child(editLocation.id).once('value', function(snapshot) {
    					exist = (snapshot.val() !== null);
					});
					if (exist === true) {
						console.log('update location');
						itemId = editLocation.id;
					} else {
						console.log('new location');
						itemId = firebaseRef.ref('locations').push().getKey();
					}
					firebaseRef.ref('locations').child(itemId).update({
						id: itemId,
						name: name,
						street: street,
						streetNumber: streetNumber,
						city: city,
						isMobile: isMobile,
						lat: lat,
						lng: lng,
						startDate: startDate,
						endDate: endDate
					});

					toastSuccess.fitInto = toastContainer;
					toastSuccess.open();
				}
			});
		}
	};

	function removeLocation(location) {
		delete locations[location.id];
	};

	function listenForChanges() {

		let locationsDb = firebaseRef.ref('locations');

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

			let oldLocation = locations[fetchedLocation.val().id];
			let updatedLocation = initLocation(fetchedLocation.val());

			poly.splice('items', indexOf(poly.items, oldLocation.id), 1);
			poly.unshift('items', updatedLocation);
			poly.$.grid.clearCache();

			removeMarker(oldLocation.getMarker());
			renderMarker(updatedLocation.getMarker());
		});

		locationsDb.on('child_moved', function(fetchedLocation) {

		});
	}

	function initLocation(fetchedLocation) {
		let newLocation = new Location(fetchedLocation.id, fetchedLocation.name, fetchedLocation.street,
		 fetchedLocation.streetNumber, fetchedLocation.city, fetchedLocation.lat, fetchedLocation.lng, fetchedLocation.isMobile,
		 fetchedLocation.startDate, fetchedLocation.endDate);

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
			this.startDate = startDate;
			this.endDate = endDate;
			this.marker = document.createElement('google-map-marker');
		}

		getInfoWindowContent() {
			let dates = '';

			if(this.isMobile == 'true') {
				dates = '<p>' + this.startDate + ' - ' + this.endDate + '</p>';
			}

			return '<h3>' + this.name + '</h3>'
				+ '<p>' + this.street + ' ' + this.streetNumber + ', ' + this.city + '</p>'
				+ dates;
		}

		getMarker() {
			this.marker.setAttribute('latitude', this.lat);
			this.marker.setAttribute('longitude', this.lng);
			this.marker.setAttribute('title', this.name);
			this.marker.setAttribute('id', this.id);
			this.marker.innerHTML = this.getInfoWindowContent();

			return this.marker;
		}
	};

})();
