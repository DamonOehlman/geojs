var assert = require('assert'),
    assertPos = require('../tools/assertpos'),
    GeoJS = require('../../lib/geojs');

module.exports = {
    'Position Tests': {
        topic: new GeoJS.Pos(-27, 153),
        
        'can be initialized from floating point values': function(pos) {
            assert.equal(pos.lat, -27);
            assert.equal(pos.lon, 153);
        },

        'is able to project a position from a point given a bearing and distance': function(pos) {
            var testPos = pos.to(180, 100);
            
            assertPos.equal(testPos, '-27.899 153', 3);
        }
    }
};