(function(scope) {
    
    /* exports */
    
    function compress(points, precision) {
        console.log(scope);
    } // compress
    
    function decompress(encoded, prevision) {
        
    } // decompress
    
    scope.Compressor = {
        compress: compress,
        decompress: decompress
    };
})(typeof module != 'undefined' && module.exports ? module.exports : GeoJS);