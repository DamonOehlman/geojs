var assert = require('assert');

exports.equal = function(target, comparison, decimals) {
    var comparisonPos = new GeoJS.Pos(comparison),
        cFactor = Math.pow(10, decimals || 3);
        
    assert.equal((target.lat * cFactor | 0) / cFactor, comparisonPos.lat);
    assert.equal((target.lon * cFactor | 0) / cFactor, comparisonPos.lon);
};