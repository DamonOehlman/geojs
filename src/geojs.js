(function() {
    //= require "core/constants"
    //= require "core/pos"
    //= require "core/bbox"
    //= require "core/distance"
    
    var GeoJS = this.GeoJS = {
        Pos: Pos,
        BBox: BBox,
        Distance: Distance
    };
    
    if (typeof module != 'undefined' && module.exports) {
        module.exports = GeoJS;
    } // if
})();