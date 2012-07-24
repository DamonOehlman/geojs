describe('GeoJS.Pos initialization', function() {
    var GeoJS = require('../dist/commonjs/geojs'),
        expect = require('expect.js');

    it('should be able to create a new position from numeric values', function() {
        var pos = new GeoJS.Pos(-27, 153);

        expect(pos.lat).to.equal(-27);
        expect(pos.lon).to.equal(153);
    });
    
    it('should be able to parse a position from a string', function() {
        var pos = new GeoJS.Pos('-27 153');
        
        expect(pos.lat).to.equal(-27);
        expect(pos.lon).to.equal(153);
    });
    
    it('should be able to parse a comma-delimited position from a string', function() {
        var pos = new GeoJS.Pos('-27,153');
        
        expect(pos.lat).to.equal(-27);
        expect(pos.lon).to.equal(153);
    });
    
    it('should be able to parse a position from a strong (floats)', function() {
        var pos = new GeoJS.Pos('-27.09324 153.12342');
        
        expect(pos.lat).to.equal(-27.09324);
        expect(pos.lon).to.equal(153.12342);
    });

    it('should be able to parse a comma-delimited position from a strong (floats)', function() {
        var pos = new GeoJS.Pos('-27.09324,153.12342');
        
        expect(pos.lat).to.equal(-27.09324);
        expect(pos.lon).to.equal(153.12342);
    });
});