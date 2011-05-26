(function() {
    //= require "core/constants"
    //= require "core/pos"
    //= require "core/bbox"
    //= require "core/distance"
    
    var isCommonJS = typeof module != 'undefined' && module.exports,
        GeoJS = this.GeoJS = {
            Pos: Pos,
            BBox: BBox,
            Distance: Distance,
        
            include: function(input) {
                if (isCommonJS) {
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
    
    if (isCommonJS) {
        module.exports = GeoJS;
    } // if
})();