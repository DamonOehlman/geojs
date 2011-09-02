// ensure that we have addressing
GeoJS.include('addressing,routing', function(addressing, routing) {
    //= cog!jsonp
    
    //= decarta/routing
    
    // assign the decarta routing method
    routing.run = function(waypoints, options, callback) {
        callback('Decarta routing engine needs to be implemented');
    }; 
});