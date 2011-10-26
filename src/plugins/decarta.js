(typeof module != 'undefined' ? module : GeoJS.define('routing')).exports = (function() {

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