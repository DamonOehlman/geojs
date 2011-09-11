var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    suite = vows.describe('GeoJS Test Suite');
    
// add the test batches
suite.addBatch(require('./batches/pos'));
suite.addBatch(require('./batches/distance'));
suite.addBatch(require('./batches/line'));
suite.addBatch(require('./batches/geohash'));
suite.addBatch(require('./batches/addressing'));

// run the suite
suite.run();