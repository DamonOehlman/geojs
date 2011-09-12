var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    GeoJS = require('../../lib/GeoJS'),
    parseTests = {};
    
function checkAddress(testData, Addressing) {
    var parsedAddress = Addressing.parse(testData.input);
        
    assert.ok(parsedAddress);
    
    for (var key in testData.output) {
        var testValue = parsedAddress[key];
        
        // if the test value is an array, then convert to a string, by joining segments
        if (testValue && testValue.join) {
            testValue = testValue.join(' ');
        } // if
        
        // assert.ok(testValue);
        assert.equal(
            testData.output[key], 
            testValue, 
            testData.input + ': "' + key + '" match error: "' + 
                testValue + '" !== "' + testData.output[key] + '"'
        );
    } // for
} // createParseTest

module.exports = {
    'Addressing tests': {
        topic: function() {
            var callback = this.callback;
            
            GeoJS.plugin('addressing', function(err, Addressing) {
                callback(err, Addressing, require('../tools/loader').getAddresses());
            });
        },
        
        'plugin available': function(err, Addressing) {
            assert.ok(Addressing) && assert.ok(Addressing.parse);
        },
        
        'parse test addresses': function(err, Addressing, testAddresses) {
            testAddresses.forEach(function(address) {
                checkAddress(address, Addressing);
            });
        }
    }
};