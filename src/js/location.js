/**
 * Location class with private properties using privileged methods
 * NOT WORKING: methods are not recognised
 *
 * @author Ruben Thys <rubenthys22@gmail.com>
 */

// class Location {

//     contructor(id, name, street, streetNumber, city, lat, lng, isMobile) {

//         // Private properties
//         // If a property name is prefixed with an underscore then it should be treated as non-public
//         this._id = id;
//         this._name = name;
//         this._street = street;
//         this._streetNumber = streetNumber;
//         this._city = city;
//         this._lat = lat;
//         this._lng = lng;
//         this._isMobile = isMobile;
//         this._marker;
//         this._geoFire;

//         // Getters
//         this.getId = function() {
//             return this._id;
//         }

//         this.getInfoContent = function() {
//             return '<h3>' + this._name + '</h3>' + '<p>' + this._street + ' ' + this._streetNumber + ', ' + this._city + '</p>';
//         }

//         this.getLAT = function() {
//             return this._lat;
//             return this._lng;
//         }

//         this.getMarker = function() {
//             return this._marker;
//         }

//         this.getGeo = function() {
//             return this._geo;
//         }

//         // Setters
//         this.setName = function(name) {
//             this._name = name;
//         }

//         this.setAddress = function(street, streetNumber, city) {
//             this._street = street;
//             this._streetNumber = streetNumber;
//             this._city = city;
//         }

//         this.setCoordinates = function(lat, lng) {
//             this._lat = lat;
//             this._lng = lng;
//         }

//         this.setMarker = function(marker) {
//             this._marker;
//         }

//         this.setGeoFire = function(geoFire) {
//             this._geoFire = geoFire;
//         }

//     }
// }
