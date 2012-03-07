var expectgeo = require('expect.js');

expectgeo.Assertion.prototype.equalPos = function(comparison, decimals) {
    var cFactor = Math.pow(10, decimals || 3),
        precisionMsg = ' (accurate to ' + (decimals || 3) + ' decimals)';
        
    this.assert(
        (this.obj.lat * cFactor | 0) / cFactor === comparison.lat,
        'expected latitude (' + this.obj.lat + ') to equal: ' + comparison.lat + precisionMsg,
        'expected latitude (' + this.obj.lat + ') to not equal: ' + comparison.lat + precisionMsg
    );

    this.assert(
        (this.obj.lon * cFactor | 0) / cFactor === comparison.lon,
        'expected longitude (' + this.obj.lon + ') to equal: ' + comparison.lon + precisionMsg,
        'expected longitude (' + this.obj.lon + ') to not equal: ' + comparison.lon + precisionMsg
    );
    
    return this;
};

if (typeof module != 'undefined') {
    module.exports = expectgeo;
}