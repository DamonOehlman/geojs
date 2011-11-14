(typeof module != 'undefined' ? module : GeoJS.define('routing')).exports = (function() {
    
    // if we are running in CommonJS we will have to include GeoJS
    if (typeof GeoJS == 'undefined') {
        GeoJS = require('geojs');
    }
    
    //= cog!log
    //= cog!jsonp
    //= cog!stringtools
    //= timelord!
    
    //= decarta/config
    
    //= decarta/core
    //= decarta/tileserver
    //= decarta/request
    //= decarta/geocoder
    //= decarta/routing

    return {
        applyConfig: applyConfig,
        getTileConfig: getTileConfig
    };
})();