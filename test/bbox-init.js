describe('GeoJS.BBox initialization (using Leaflet style Positions)', function() {
    var GeoJS = require('../pkg/cjs/geojs'),
        expect = require('expect.js'),
        dummyMin = { lat: -37, lon: 112 },
        dummyMax = { lat: -7, lon: 156 };
        dummyMinLeaflet = { lat: -37, lng: 112 },
        dummyMaxLeaflet = { lat: -7, lng: 156 };
        
    function checkBounds(bounds) {
        expect(bounds).to.be.ok();
        
        expect(bounds.min).to.be.ok();
        expect(bounds.min.lat).to.equal(-37);
        expect(bounds.min.lon).to.equal(112);
        
        expect(bounds.max).to.be.ok();
        expect(bounds.max.lat).to.equal(-7);
        expect(bounds.max.lon).to.equal(156);
    }

    it('should be able to create a valid bbox', function() {
        checkBounds(GeoJS.BBox(dummyMin, dummyMax));
    });
    
    it('should be able to create a valid bbox (inverted input)', function() {
        checkBounds(GeoJS.BBox(dummyMax, dummyMin));
    });

    it('should be able to create a valid bbox (Leaflet style)', function() {
        checkBounds(GeoJS.BBox(dummyMinLeaflet, dummyMaxLeaflet));
    });
    
    it('should be able to create a valid bbox (Leaflet style - inverted input)', function() {
        checkBounds(GeoJS.BBox(dummyMaxLeaflet, dummyMinLeaflet));
    });
});