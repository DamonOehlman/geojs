var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    suite = vows.describe('GeoJS Test Suite'),
    
    // define the includes
    includes = [
        // core types
        './batches/pos',
        './batches/distance',
        './batches/line',
      
        // plugins
        './batches/plugin',
        './batches/geohash',
        './batches/addressing',
        
        // engines
        './engines/decarta'
    ],
    testsLoading = 0;
    
function loadedBatch() {
    testsLoading--;
    
    if (testsLoading <= 0) {
        suite.run();
    } // if
}; // 
    
// iterate through the includes and add
includes.forEach(function(include) {
    var batch = require(include);
    
    if (typeof batch == 'function') {
        testsLoading++;
        batch(suite, function() {
            setTimeout(loadedBatch, 0);
        });
    }
    else {
        suite.addBatch(batch);
    } // if..else
});

if (testsLoading <= 0) {
    suite.run();
} // if