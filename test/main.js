var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    suite = vows.describe('GeoJS Test Suite');
    
// add the core tests
suite.addBatch(require('./batches/pos'));
suite.addBatch(require('./batches/distance'));
suite.addBatch(require('./batches/line'));

// add the plugin tests
suite.addBatch(require('./batches/plugin'));
suite.addBatch(require('./batches/geohash'));
suite.addBatch(require('./batches/addressing'));

// test the decarta engine
suite.addBatch(require('./engines/decarta'));

// run the suite
suite.run();