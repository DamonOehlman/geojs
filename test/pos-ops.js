describe('GeoJS.Pos operations', function() {
    var GeoJS = require('../dist/commonjs/geojs'),
        expect = require('./helpers/expectgeo'),
        testPos;

    beforeEach(function() {
        testPos = new GeoJS.Pos(-27, 153);
    });
    
    it('is able to project a position from a point given a bearing and distance', function() {
        var updatedPos = testPos.to(180, 100);
        
        expect(updatedPos).to.equalPos(new GeoJS.Pos(-27.899, 153));
    });
});