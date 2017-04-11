(function() {

    'use strict';

    // Initialize the Firebase SDK
    firebase.initializeApp({
        apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
        databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
    });

    // Generate a random Firebase location
    var firebaseRefLocations = firebase.database().ref('locations');
    var firebaseRefLocations_geo = firebase.database().ref('locations_geo');

    // Create a new GeoFire instance at the random Firebase location
    var geoFire = new GeoFire(firebaseRefLocations_geo);

    // Create the locations for each fish
    var fishLocations = [
        [-40, 159],
        [90, 70],
        [-46, 160],
        [0, 0]
    ];

    // Set the initial locations of the fish in GeoFire
    console.log("*** Setting initial locations ***");
    var promises = fishLocations.map(function(location, index) {
        return geoFire.set("location" + index, location).then(function() {
            console.log("location" + index + " initially set to [" + location + "]");
        });
    });

})();