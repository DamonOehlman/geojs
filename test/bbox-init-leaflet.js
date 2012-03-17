describe('GeoJS.BBox initialization (from leaflet L.LatLngBounds)', function() {
    var GeoJS = require('../geojs'),
        expect = require('expect.js'),
        dummyMin = { lat: -37, lng: 112 },
        dummyMax = { lat: -7, lng: 156 };

    it('should be able to create a valid pos from an alternative bounding box pos format', function() {
        var bounds = new GeoJS.BBox(dummyMin, dummyMax);
        
        console.log(bounds);
        
        expect(bounds).to.be.ok();
        
        expect(bounds.min).to.be.ok();
        expect(bounds.min.lat).to.equal(-37);
        expect(bounds.min.lon).to.equal(112);
        
        expect(bounds.max).to.be.ok();
        expect(bounds.max.lat).to.equal(-7);
        expect(bounds.max.lon).to.equal(156);
    });
});