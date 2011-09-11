var assert = require('assert'),
    GeoJS = require('../../lib/geojs');

module.exports = {
    'Distance Tests': {
        'can be initialized from an integer value': function() {
            var dist = new GeoJS.Distance(5);
            
            assert.equal(dist.meters, 5);
        },
        
        'can be initialized from a float value': function() {
            var dist = new GeoJS.Distance(10.4);
            
            assert.equal(dist.meters, 10.4);
        },

        'can parse the string "10M"': function() {
            var dist = new GeoJS.Distance('10M');
            
            assert.equal(dist.meters, 10);
        },

        'can parse the string "10 m"': function() {
            var dist = new GeoJS.Distance('10 m');
            
            assert.equal(dist.meters, 10);
        },

        'can parse the string "10KM"': function() {
            var dist = new GeoJS.Distance('10KM');
            
            assert.equal(dist.meters, 10000);
        },

        'can parse the string "0.01KM"': function() {
            var dist = new GeoJS.Distance('0.01KM');
            
            assert.equal(dist.meters, 10);
        },

        'can parse the string "0.01 Km"': function() {
            var dist = new GeoJS.Distance('0.01 Km');
            
            assert.equal(dist.meters, 10);
        },

        'can parse the string "10"': function() {
            var dist = new GeoJS.Distance('10');
            
            assert.equal(dist.meters, 10);
        }
    }
};