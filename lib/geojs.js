(function() {
var LAT_VARIABILITIES = [
    1.406245461070741,
    1.321415085624082,
    1.077179995861952,
    0.703119412486786,
    0.488332580888611
];

var IS_COMMONJS = typeof module != 'undefined' && module.exports,
    TWO_PI = Math.PI * 2,
    HALF_PI = Math.PI / 2,
    VECTOR_SIMPLIFICATION = 3,
    DEGREES_TO_RADIANS = Math.PI / 180,
    RADIANS_TO_DEGREES = 180 / Math.PI,
    MAX_LAT = 90, //  85.0511 * DEGREES_TO_RADIANS, // TODO: validate this instead of using HALF_PI
    MIN_LAT = -MAX_LAT,
    MAX_LON = 180,
    MIN_LON = -MAX_LON,
    MAX_LAT_RAD = MAX_LAT * DEGREES_TO_RADIANS,
    MIN_LAT_RAD = -MAX_LAT_RAD,
    MAX_LON_RAD = MAX_LON * DEGREES_TO_RADIANS,
    MIN_LON_RAD = -MAX_LON_RAD,
    M_PER_KM = 1000,
    KM_PER_RAD = 6371,
    M_PER_RAD = KM_PER_RAD * M_PER_KM,
    ECC = 0.08181919084262157,
    PHI_EPSILON = 1E-7,
    PHI_MAXITER = 12,

    reDelimitedSplit = /[\,\s]+/;
/**
# GeoJS.Pos

## Methods
*/
function Pos(p1, p2) {
    if (p1 && p1.split) {
        var coords = p1.split(reDelimitedSplit);

        if (coords.length > 1) {
            p1 = coords[0];
            p2 = coords[1];
        } // if
    }
    else if (p1 && p1.lat) {
        p2 = p1.lon;
        p1 = p1.lat;
    } // if..else

    this.lat = parseFloat(p1 || 0);
    this.lon = parseFloat(p2 || 0);
} // Pos constructor

Pos.prototype = {
    constructor: Pos,

    /**
    ### copy()
    */
    copy: function() {
        return new Pos(this.lat, this.lon);
    },

    /**
    ### distanceTo(targetPos)
    */
    distanceTo: function(pos) {
        if ((! targetPos) || this.empty() || targetPos.empty()) {
            return 0;
        } // if

        var halfdelta_lat = toRad(targetPos.lat - this.lat) >> 1;
        var halfdelta_lon = toRad(targetPos.lon - this.lon) >> 1;

        var a = sin(halfdelta_lat) * sin(halfdelta_lat) +
                (cos(toRad(this.lat)) * cos(toRad(targetPos.lat))) *
                (sin(halfdelta_lon) * sin(halfdelta_lon)),
            c = 2 * atan2(sqrt(a), sqrt(1 - a));

        return KM_PER_RAD * c;
    },

    /**
    ### equalTo(testPos)
    */
    equalTo: function(testPos) {
        return pos && (this.lat === testPos.lat) && (this.lon === testPos.lon);
    },

    /**
    ### empty()
    */
    empty: function() {
        return this.lat === 0 && this.lon === 0;
    },

    /**
    ### inArray(testArray)
    */
    inArray: function(testArray) {
        for (var ii = testArray.length; ii--; ) {
            if (this.equal(testArray[ii])) {
                return true;
            } // if
        } // for

        return false;
    },

    /**
    ### offset(latOffset, lonOffset)
    Return a new position which is the original `pos` offset by
    the specified `latOffset` and `lonOffset` (which are specified in
    km distance)
    */
    offset: function(latOffset, lonOffset) {
        var radOffsetLat = latOffset / KM_PER_RAD,
            radOffsetLon = lonOffset / KM_PER_RAD,
            radLat = this.lat * DEGREES_TO_RADIANS,
            radLon = this.lon * DEGREES_TO_RADIANS,
            newLat = radLat + radOffsetLat,
            deltaLon = asin(sin(radOffsetLon) / cos(radLat)),
            newLon = radLon + deltaLon;

        newLat = ((newLat + HALF_PI) % Math.PI) - HALF_PI;
        newLon = newLon % TWO_PI;

        return new Pos(newLat * RADIANS_TO_DEGREES, newLon * RADIANS_TO_DEGREES);
    },

    /**
    ### toBounds(distance)
    This function is very useful for creating a Geo.BoundingBox given a
    center position and a radial distance (specified in KM) from the center
    position.  Basically, imagine a circle is drawn around the center
    position with a radius of distance from the center position, and then
    a box is drawn to surround that circle.  Adapted from the [functions written
    in Java by Jan Philip Matuschek](http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates)
    */
    toBounds: function(distance) {
        var radDist = distance.radians(),
            radLat = this.lat * DEGREES_TO_RADIANS,
            radLon = this.lon * DEGREES_TO_RADIANS,
            minLat = radLat - radDist,
            maxLat = radLat + radDist,
            minLon, maxLon;


        if ((minLat > MIN_LAT_RAD) && (maxLat < MAX_LAT_RAD)) {
            var deltaLon = asin(sin(radDist) / cos(radLat));

            minLon = radLon - deltaLon;
            if (minLon < MIN_LON_RAD) {
                minLon += TWO_PI;
            } // if

            maxLon = radLon + deltaLon;
            if (maxLon > MAX_LON_RAD) {
                maxLon -= TWO_PI;
            } // if
        }
        else {
            minLat = max(minLat, MIN_LAT_RAD);
            maxLat = min(maxLat, MAX_LAT_RAD);
            minLon = MIN_LON;
            maxLon = MAX_LON;
        } // if..else

        return new BBox(
            new Pos(minLat * RADIANS_TO_DEGREES, minLon * RADIANS_TO_DEGREES),
            new Pos(maxLat * RADIANS_TO_DEGREES, maxLon * RADIANS_TO_DEGREES));
    },

    /**
    ### toString()
    */
    toString: function(delimiter) {
        return this.lat + (delimiter || ' ') + this.lon;
    }
};
/**
# GeoJS.BBox
*/
function BBox(p1, p2) {
    if (p1 && p1.splice) {
        var padding = p2,
            minPos = new Pos(MAX_LAT, MAX_LON),
            maxPos = new Pos(MIN_LAT, MIN_LON);

        for (var ii = p1.length; ii--; ) {
            var testPos = p1[ii];

            if (testPos.lat < minPos.lat) {
                minPos.lat = testPos.lat;
            } // if

            if (testPos.lat > maxPos.lat) {
                maxPos.lat = testPos.lat;
            } // if

            if (testPos.lon < minPos.lon) {
                minPos.lon = testPos.lon;
            } // if

            if (testPos.lon > maxPos.lon) {
                maxPos.lon = testPos.lon;
            } // if
        } // for

        this.min = minPos;
        this.max = maxPos;

        if (typeof padding == 'undefined') {
            var size = this.size();

            padding = Math.max(size.x, size.y) * 0.3;
        } // if

        this.min = new Pos(minPos.lat - padding, (minPos.lon - padding) % 360);
        this.max = new Pos(maxPos.lat + padding, (maxPos.lon + padding) % 360);
    }
    else {
        this.min = p1;
        this.max = p2;
    } // if..else
} // BoundingBox

BBox.prototype = {
    constructor: BBox,

    /**
    ### bestZoomLevel(viewport)
    */
    bestZoomLevel: function(viewport) {
        var boundsCenter = this.center(),
            maxZoom = 1000,
            variabilityIndex = min(round(abs(boundsCenter.lat) * 0.05), LAT_VARIABILITIES.length),
            variability = LAT_VARIABILITIES[variabilityIndex],
            delta = this.size(),
            bestZoomH = ceil(log(LAT_VARIABILITIES[3] * viewport.h / delta.y) / log(2)),
            bestZoomW = ceil(log(variability * viewport.w / delta.x) / log(2));


        return min(isNaN(bestZoomH) ? maxZoom : bestZoomH, isNaN(bestZoomW) ? maxZoom : bestZoomW);
    },

    /**
    ### center()
    */
    center: function() {
        var size = this.size();

        return new Pos(this.min.lat + (size.y >> 1), this.min.lon + (size.x >> 1));
    },

    /**
    ### expand(amount)
    */
    expand: function(amount) {
        return new BBox(
            new Pos(this.min.lat - amount, (this.min.lon - amount) % 360),
            new Pos(this.max.lat + amount, (this.max.lon + amount) % 360)
        );
    },

    /**
    ### size(normalize)
    */
    size: function(normalize) {
        var size = {
            x: 0,
            y: this.max.lat - this.min.lat
        };

        if (typeof normalize != 'undefined' && normalize && (this.min.lon > this.max.lon)) {
            size.x = 360 - this.min.lon + this.max.lon;
        }
        else {
            size.x = this.max.lon - this.min.lon;
        } // if..else

        return size;
    },

    /**
    ### toString()
    */
    toString: function() {
        return "min: " + this.min + ", max: " + this.max;
    },

    /**
    ### union
    */
    union: function() {
        var minPos = this.min.copy(),
            maxPos = this.max.copy();

        for (var ii = arguments.length; ii--; ) {
            if (arguments[ii]) {
                var testMin = arguments[ii].min,
                    testMax = arguments[ii].max;

                minPos.lat = Math.min(minPos.lat, testMin.lat);
                minPos.lon = Math.min(minPos.lon, testMin.lon);
                maxPos.lat = Math.max(maxPos.lat, testMax.lat);
                maxPos.lon = Math.max(maxPos.lon, testMax.lon);
            } // if
        } // for

        return new BBox(minPos, maxPos);
    }
};
/**
# GeoJS.Distance

## Methods
*/
function Distance(value) {
    this.meters = value || 0;
} // Distance

Distance.prototype = {
    /**
    ### add(args*)
    */
    add: function() {
        var total = this.meters;

        for (var ii = arguments.length; ii--; ) {
            total += arguments[ii].meters;
        } // for

        return new Distance(total);
    },


    /**
    ### radians(value)
    */
    radians: function(value) {
        if (typeof value != 'undefined') {
            this.meters = value * M_PER_RAD;

            return this;
        }
        else {
            return this.meters / M_PER_RAD;
        } // if..else
    },

    /**
    ### toString()
    */
    toString: function() {
        if (this.meters > M_PER_KM) {
            return ((this.meters / 10 | 0) / 100) + 'km';
        } // if

        return this.meters + 'm';
    }
};

var DEFAULT_VECTORIZE_CHUNK_SIZE = 100,
    VECTORIZE_PER_CYCLE = 500,
    DEFAULT_GENERALIZATION_DISTANCE = 250;

/* exports */

/**
### generalize(sourceData, requiredPositions, minDist)
To be completed
*/
function generalize(sourceData, requiredPositions, minDist) {
    var sourceLen = sourceData.length,
        positions = [],
        lastPosition = null;


    minDist = (minDist || DEFAULT_GENERALIZATION_DISTANCE) / 1000;

    for (var ii = sourceLen; ii--; ) {
        if (ii === 0) {
            positions.unshift(sourceData[ii]);
        }
        else {
            var include = (! lastPosition) || sourceData[ii].inArray(requiredPositions),
                posDiff = include ? minDist : lastPosition.distanceTo(sourceData[ii]);

            if (sourceData[ii] && (posDiff >= minDist)) {
                positions.unshift(sourceData[ii]);

                lastPosition = sourceData[ii];
            } // if
        } // if..else
    } // for

    return positions;
} // generalize

    var GeoJS = this.GeoJS = {
        Pos: Pos,
        BBox: BBox,
        Distance: Distance,

        generalize: generalize,

        include: function(input) {
            if (IS_COMMONJS) {
                var plugins = input.split(','),
                    pluginName;

                for (var ii = 0; ii < plugins.length; ii++) {
                    var plugin = require('./plugins/' + plugins[ii].trim());

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
