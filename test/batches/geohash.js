var assert = require('assert'),
    GeoJS = require('../../lib/GeoJS'),
    testItems = [{
        pos:  '-27.467379 153.192271',
        hash: 'r7hgtzxnytkq'
    }];
    
module.exports = {
    'GeoHash tests': {
        topic: function() {
            GeoJS.plugin('geohash', this.callback);
        },
        
        'can encode positions to hashes': function(err, Geohash) {
            for (var ii = 0; ii < testItems.length; ii++) {
                var pos = new GeoJS.Pos(testItems[ii].pos),
                    hash = Geohash.encode(pos);
                    
                assert.equal(hash, testItems[ii].hash);
            } // for
        },
        
        'can decode hashes into position objects': function(err, Geohash) {
            for (var ii = 0; ii < testItems.length; ii++) {
                var pos = new GeoJS.Pos(testItems[ii].pos),
                    testPos = Geohash.decode(testItems[ii].hash);
                    
                assert.equal(pos.lat * 1000 | 0, testPos.lat * 1000 | 0);
                assert.equal(pos.lon * 1000 | 0, testPos.lon * 1000 | 0);
            }
        }
    }
};