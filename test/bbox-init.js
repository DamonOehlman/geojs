describe('GeoJS.BBox initialization (using Leaflet style Positions)', function() {
    var GeoJS = require('../dist/commonjs/geojs'),
        expect = require('expect.js'),
        dummyMin = { lat: -37, lon: 112 },
        dummyMax = { lat: -7, lon: 156 },
        dummyMinLeaflet = { lat: -37, lng: 112 },
        dummyMaxLeaflet = { lat: -7, lng: 156 },
        stringMin = '-37 112',
        stringMax = '-7 156';
        
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
    
    it('should be able to create a valid bbox (mixed Leaflet + default)', function() {
        checkBounds(GeoJS.BBox(dummyMinLeaflet, dummyMax));
    });
    
    it('should be able to create a valid bbox (mixed Leaflet + default - inverted input)', function() {
        checkBounds(GeoJS.BBox(dummyMaxLeaflet, dummyMin));
    });

    it('should be able to create a valid bbox (string values)', function() {
        checkBounds(GeoJS.BBox(stringMin, stringMax));
    });
    
    it('should be able to create a valid bbox (string values - inverted input)', function() {
        checkBounds(GeoJS.BBox(stringMax, stringMin));
    });
    
    it('should be able to create a valid bbox (mixed string + default)', function() {
        checkBounds(GeoJS.BBox(dummyMin, stringMax));
    });
    
    it('should be able to create a valid bbox (mixed string + default - inverted input)', function() {
        checkBounds(GeoJS.BBox(dummyMax, stringMin));
    });
});