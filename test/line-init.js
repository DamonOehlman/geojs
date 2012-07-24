describe('GeoJS.Line initialization', function() {
    var GeoJS = require('../dist/commonjs/geojs'),
        expect = require('expect.js'),
        testPositions,
        testPositionsText,
        segmentMeters = [36, 122, 29];
        
    beforeEach(function() {
        // test data
        testPositions = [
            new GeoJS.Pos(-27.47399, 153.11752),
            new GeoJS.Pos(-27.47408, 153.11788),
            new GeoJS.Pos(-27.47438, 153.11908),
            new GeoJS.Pos(-27.47443, 153.11937)
        ];

        testPositionsText = [
            '-27.47399, 153.11752',
            '-27.47408, 153.11788',
            '-27.47438, 153.11908',
            '-27.47443, 153.11937'
        ];
    });
    
    it('can be initialized from a position array', function() {
        var line = new GeoJS.Line(testPositions);
        
        expect(line.positions.length).to.equal(4);
    });
    
    it('can be initialized from a string array', function() {
        var line = new GeoJS.Line(testPositionsText);
        
        expect(line.positions).to.eql(new GeoJS.Line(testPositions).positions);
    });
});