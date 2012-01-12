var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    GeoJS = require('../../lib/geojs'),
    debug = require('debug')('tests'),
    parseTests = {};
    
function checkAddress(testData, Addressing) {
    var parsedAddress = Addressing.parse(testData.input);
        
    debug('parsed ' + testData.input + ': ', parsedAddress);
        
    assert.ok(parsedAddress);
    assert.ok(testData.output, "No output address supplied");
    
    for (var key in testData.output) {
        var testValue = parsedAddress[key],
            requiredValue = testData.output[key];

        assert.ok(testValue, testData.input + ' has no ' + key + ' part');
        
        if (testValue.join) {
            assert.equal(testValue.length, requiredValue.length);
            
            testValue.forEach(function(part, index) {
                assert.equal(part, requiredValue[index]);
            });
        }
        else {
            assert.equal(
                requiredValue, 
                testValue, 
                testData.input + ': "' + key + '" match error: "' + testValue + '" !== "' + requiredValue + '"'
            );
        } // if.else
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