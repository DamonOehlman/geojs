describe('GeoJS.Line operations', function() {
    var GeoJS = require('../dist/commonjs/geojs'),
        expect = require('./helpers/expectgeo'),
        testline,
        segmentMeters = [36, 122, 29];

    beforeEach(function() {
        // test data
        testline = new GeoJS.Line([
            new GeoJS.Pos(-27.47399, 153.11752),
            new GeoJS.Pos(-27.47408, 153.11788),
            new GeoJS.Pos(-27.47438, 153.11908),
            new GeoJS.Pos(-27.47443, 153.11937)
        ]);
    });
    
    it('can traverse the line', function() {
        var pos = testline.traverse(0.1);
        expect(pos).to.equalPos(new GeoJS.Pos('-27.474 153.118'));
    });
    
    it('has a distance that can be calculated', function() {
        var distance = testline.distance(),
            totalMeters = Math.floor(distance.total * 1000);

        expect(totalMeters).to.equal(189);

        // check the segment meters
        for (var ii = 0; ii < segmentMeters.length; ii++) {
            expect(Math.floor(distance.segments[ii] * 1000)).to.equal(segmentMeters[ii]);
        } // for
    });
});