(function() {
    //= require "core/constants"
    //= require "core/pos"
    //= require "core/line"
    //= require "core/bbox"
    //= require "core/distance"
    
    //= require "core/functions"
    
    var GeoJS = this.GeoJS = {
        Pos: Pos,
        Line: Line,
        BBox: BBox,
        Distance: Distance,
        
        generalize: generalize,
    
        include: function(input) {
            if (IS_COMMONJS) {
                var plugins = input.split(','),
                    pluginName;
                
                for (var ii = 0; ii < plugins.length; ii++) {
                    var plugin = require('./plugins/' + plugins[ii].trim());
                    
                    // iterate through the plugin and add members to GeoJS
                    for (var key in plugin) {
                        GeoJS[key] = plugin[key];
                    } // for
                } // for
            }
            
            return GeoJS;
        }
    };
    
    if (IS_COMMONJS) {
        module.exports = GeoJS;
    } // if
})();