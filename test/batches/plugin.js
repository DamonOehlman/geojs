var assert = require('assert'),
    GeoJS = require('../../lib/geojs');
    
module.exports = function(suite, callback) {
    suite.addBatch({
        'Plugin Definition': {
            topic: GeoJS.define('test-plugin').exports = {
                test: function() {
                    return true;
                }
            },

            'plugin correctly defined': function(plugin) {
                assert.ok(plugin);
                assert.ok(plugin.test);
                assert.ok(plugin.test());
            }
        }
    });
    
    suite.addBatch({
        'Plugin Loading': {
            topic: function() {
                GeoJS.plugin('geohash', this.callback);
            },
            
            'Geohash plugin available': function(err, geohash) {
                assert.isNull(err);
                
                assert.ok(geohash, 'Geohash defined');
                assert.ok(geohash.encode, 'Geohash encode function available');
            }
        }
    });
    
    suite.addBatch({
        'Plugin Multi-Loading': {
            topic: function() {
                GeoJS.plugin('geohash, addressing , routing', this.callback);
            },
            
            'plugins available': function(err, geohash, addressing, routing) {
                assert.isNull(err);
                
                assert.ok(geohash);
                assert.ok(addressing);
                assert.ok(routing);
            }
        }
    });
    
    callback();
};