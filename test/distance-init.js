describe('GeoJS.Distance initialization', function() {
    var GeoJS = require('../dist/commonjs/geojs'),
        expect = require('expect.js');

    it('can be initialized from an integer value', function() {
        expect(new GeoJS.Distance(5).meters).to.equal(5);
    });
    
    it('can be initialized from a float value', function() {
        expect(new GeoJS.Distance(10.4).meters).to.equal(10.4);
    });
    
    it('can parse the string "10M"', function() {
        expect(new GeoJS.Distance('10M').meters).to.equal(10);
    });
    
    it('can parse the string "10 m"', function() {
        expect(new GeoJS.Distance('10 m').meters).to.equal(10);
    });

    it('can parse the string "10KM"', function() {
        expect(new GeoJS.Distance('10KM').meters).to.equal(10000);
    });
    
    it('can parse the string "0.01KM"', function() {
         expect(new GeoJS.Distance('0.01KM').meters).to.equal(10);
    });
    
    it('can parse the string "0.01 Km"', function() {
        expect(new GeoJS.Distance('0.01 Km').meters).to.equal(10);
    });
    
    it('can parse the string "10"', function() {
        expect(new GeoJS.Distance('10').meters).to.equal(10);
    });
});