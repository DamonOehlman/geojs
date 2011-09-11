(function() {
    
    /* internals */
    
    var definedModules = {},
        reTrim = /^(.*)\s+$/,
        reDots = /\./g;
    
    function define(id) {
        return definedModules[id] = {
            exports: {}
        };
    } // define

    function plugin(input, callback) {
        var plugins = input.split(','),
            requested = [],
            errorMessage = null;
            
        for (var ii = 0; ii < plugins.length; ii++) {
            var pluginId = plugins[ii].replace(reTrim, '$1').replace(reDots, '/');
                
            if (IS_COMMONJS) {
                requested.push(require('./plugins/' + pluginId));
            }
            else {
                requested.push(definedModules[pluginId].exports);
            } // if..else
        } // for

        requested.unshift(errorMessage);

        if (callback) {
            callback.apply(null, requested);
        } // if
    } // plugin
    
    //= core/constants
    //= core/pos
    //= core/line
    //= core/bbox
    //= core/distance
    
    //= core/functions
    
    //= core/duration
    
    var GeoJS = this.GeoJS = {
        Pos: Pos,
        Line: Line,
        BBox: BBox,
        Distance: Distance,
        
        generalize: generalize,
        
        // time types and helpers
        Duration: Duration,
        parseDuration: parseDuration,
        
        define: define,
        plugin: plugin
    };
    
    if (IS_COMMONJS) {
        module.exports = GeoJS;
    } // if
})();