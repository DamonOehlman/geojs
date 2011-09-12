var assert = require('assert'),
    GeoJS = require('../../lib/GeoJS'),
    loader = require('../tools/loader'),
    addresses = loader.getAddresses(),
    routes = loader.getRoutes();
    
module.exports = {
    'Decarta Engine Tests': {
        topic: function() {
            GeoJS.plugin('decarta,geocoder,routing', this.callback);
        },
        
        'decarta module available': function(err, decarta) {
            assert.ok(decarta);
        },
        
        'can set config': function(err, decarta) {
            
        },
        
        'test decarta geocoding': function(err, decarta, geocoder) {
            // iterate through the addresses, and geocode
            addresses.forEach(function(address) {
                geocoder.run(address.output, function(requestedAddress, matches) {
                    console.log('matches for ', requestedAddress, matches);
                });
            });
        },
        
        'test decarta routing': function(err, decarta, geocoder, routing) {
            routes.forEach(function(route) {
                routing.run(route.waypoints, function() {
                    console.log(arguments);
                });
            });
        }
    }
};