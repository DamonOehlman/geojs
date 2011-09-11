var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    GeoJS = require('../../lib/GeoJS'),
    parseTests = {},
    testAddressPath = path.resolve(__dirname, 'addresses');
    
function checkAddress(data, Addressing) {
    var testData = JSON.parse(data),
        parsedAddress = Addressing.parse(testData.input);
        
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
                var testAddresses = [];
                
                // load the parse tests
                fs.readdir(testAddressPath, function(err, files) {
                    (files ||[]).forEach(function(file) {
                        testAddresses.push(fs.readFileSync(path.join(testAddressPath, file), 'utf8'));
                    });
                    
                    callback(err, Addressing, testAddresses);
                });
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