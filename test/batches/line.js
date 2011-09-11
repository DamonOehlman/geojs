var assert = require('assert'),
    assertPos = require('../tools/assertpos'),
    GeoJS = require('../../lib/geojs'),
    
    // test data
    testPositions = [
        new GeoJS.Pos(-27.47399, 153.11752),
        new GeoJS.Pos(-27.47408, 153.11788),
        new GeoJS.Pos(-27.47438, 153.11908),
        new GeoJS.Pos(-27.47443, 153.11937)
    ],
    
    testPositionsText = [
        '-27.47399, 153.11752',
        '-27.47408, 153.11788',
        '-27.47438, 153.11908',
        '-27.47443, 153.11937'
    ],
    
    segmentMeters = [36, 122, 29];

module.exports = {
    'Line Tests': {
        'can be initialized from a position array': function() {
            var line = new GeoJS.Line(testPositions);

            assert.equal(line.positions.length, 4);
        },

        'can be initialized from an array of text': function() {
            var line = new GeoJS.Line(testPositionsText);

            assert.equal(line.positions.length, 4);
        },

        // test the distance function
        'has a distance that can be calculated': function() {
            var distance = new GeoJS.Line(testPositions).distance(),
                totalMeters = Math.floor(distance.total * 1000);

            assert.equal(totalMeters, 189);

            // check the segment meters
            for (var ii = 0; ii < segmentMeters.length; ii++) {
                assert.equal(Math.floor(distance.segments[ii] * 1000), segmentMeters[ii]);
            } // for
        },

        // test that we can traverse the line
        'can be traversed': function() {
            var pos = new GeoJS.Line(testPositions).traverse(0.1);
            
            assertPos.equal(pos, '-27.474 153.118');
        }
    }
};