var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    suite = vows.describe('GeoJS Test Suite'),
    
    // define the includes
    testsLoading = 0;
    
function loadedBatch() {
    testsLoading--;
    
    if (testsLoading <= 0) {
        suite.run();
    } // if
}; //

exports.runTests = function(includes) {
    // iterate through the includes and add
    includes.forEach(function(include) {
        var batch = require(path.resolve(__dirname, include));

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
};