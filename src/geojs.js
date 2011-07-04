(function() {
    //= require "core/constants"
    //= require "core/pos"
    //= require "core/line"
    //= require "core/bbox"
    //= require "core/distance"
    
    //= require "core/functions"
    //= require "core/plugins"
    
    //= require "core/duration"
    
    var GeoJS = this.GeoJS = {
        plugins: {},
        
        Pos: Pos,
        Line: Line,
        BBox: BBox,
        Distance: Distance,
        
        generalize: generalize,
        
        // time types and helpers
        Duration: Duration,
        parseDuration: parseDuration,
        
        define: define,
        include: include
    };
    
    if (IS_COMMONJS) {
        module.exports = GeoJS;
    } // if
})();