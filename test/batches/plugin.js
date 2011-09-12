var assert = require('assert'),
    GeoJS = require('../../lib/GeoJS');
    
module.exports = {
    'Plugin Tests': {
        topic: GeoJS.define('test-plugin').exports = {
            test: function() {
                return true;
            }
        },
        
        'plugin correctly defined': function(plugin) {
            assert.ok(plugin);
            assert.ok(plugin.test);
            assert.ok(plugin.test());
        }
    }
};