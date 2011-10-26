(function(glob) {
    
    /* internals */
    
    var definedModules = {},
        reTrim = /^\s*(.*?)\s*$/,
        reDots = /\./g,
        GeoJS = {};
    
    function define(id) {
        return definedModules[id] = {
            exports: {}
        };
    } // define

    function plugin(input, callback) {
        var plugins = input.split(','),
            requested = [],
            errors = [];
            
        for (var ii = 0; ii < plugins.length; ii++) {
            var pluginId = plugins[ii].replace(reTrim, '$1').replace(reDots, '/');
                
            if (IS_COMMONJS) {
                try {
                    var modPath = require('path').resolve(__dirname, 'plugins/' + pluginId),
                        mod = require(modPath);
                        
                    requested.push(mod);
                }
                catch (e) {
                    errors.push('Unable to load ' + pluginId);
                }
            }
            else {
                requested.push(definedModules[pluginId].exports);
            } // if..else
        } // for

        requested.unshift(errors.join(','));

        if (callback) {
            callback.apply(null, requested);
        } // if
    } // plugin
    
    //= core/constants
    
    //= core/activitylog
    
    //= core/pos
    //= core/line
    //= core/bbox
    //= core/distance
    
    (typeof module != "undefined" && module.exports) ? (module.exports = GeoJS) : (glob.GeoJS = GeoJS);
})(this);