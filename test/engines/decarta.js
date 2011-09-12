var assert = require('assert'),
    GeoJS = require('../../lib/GeoJS'),
    loader = require('../tools/loader');
    
module.exports = function(suite, callback) {
    GeoJS.plugin('decarta,geocoder,routing', function(err, decarta, geocoder, routing) {
        var geocodingTests = {},
            routingTests = {};
        
        suite.addBatch({
            'Decarta Engine Tests': {
                'module available': function() {
                    assert.ok(decarta);
                },
                
                'can set config': function() {
                    decarta.applyConfig({
                        sessionID: new Date().getTime()
                    });
                },

                'can get tileconfig': {
                    topic: function() {
                        this.suite.addBatch({
                            'Another Batch': {
                                '1 + 1': function() {
                                    assert.ok(0);
                                }
                            }
                        });

                        var callback = this.callback;

                        decarta.getTileConfig('', function(config) {
                            callback(null, config);
                        });
                    },

                    'have hosts': function(err, config) {
                        assert.ok(config.hosts);
                    }
                }                
            }
        });
        
        loader.getAddresses().forEach(function(address) {
            geocodingTests[address.input] = {
                topic: function() {
                    var callback = this.callback;
                    
                    geocoder.run(address.output, function(requestedAddress, matches) {
                        callback(null, requestedAddress, matches);
                    });
                },
                
                'address ok': function(err, requestedAddress, matches) {
                    assert.ok(matches);
                    assert.ok(matches.length);
                }
            };
        });
        
        suite.addBatch({
            'Decarta Geocoding': geocodingTests
        });

        loader.getRoutes().forEach(function(route) {
            routingTests[route.name || 'Test Route'] = {
                topic: function() {
                    var callback = this.callback;
                    
                    routing.run(route.waypoints, function(geometry, instructions) {
                        callback(null, geometry, instructions);
                    });
                },
                
                'have geometry': function(err, geometry, instructions) {
                    assert.ok(geometry);
                    assert.ok(geometry.length);
                    
                    console.log(geometry.length);
                },
                
                'have instructions': function(err, geometry, instructions) {
                    assert.ok(instructions);
                    assert.ok(instructions.length);
                }
            };
        });
        
        suite.addBatch({
            'Decarta Routing': routingTests
        });
        
        callback();
    });
};