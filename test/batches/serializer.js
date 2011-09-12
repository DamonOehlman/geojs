var assert = require('assert'),
    GeoJS = require('../../lib/GeoJS'),
    testArray = [
    ];
    
module.exports = {
    'Serializer tests': {
        topic: function() {
            GeoJS.plugin('serializer', this.callback);
        },
        
        'serialized positions are strings': function(err, serializer) {
        }
    }
};