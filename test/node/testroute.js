var GeoJS = require('../../lib/geojs').include('decarta'),
    positions = [
    ];

// run the route
GeoJS.Routing.run(positions, {}, function(err, geometry, instructions) {
    if (! err) {
        
    }
    else {
        console.error(err);
    }
});
