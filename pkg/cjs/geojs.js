

var GeoJS = {};

var LAT_VARIABILITIES = [
    1.406245461070741,
    1.321415085624082,
    1.077179995861952,
    0.703119412486786,
    0.488332580888611
];

// define some constants
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

### bearing(target)
Return the bearing in degrees to the target position.

### copy()
Return a copy of the position

### distanceTo(target)
Calculate the distance to the specified target position.  The distance
returned is in KM.

### equalTo(testPos)
Determine whether or not the position is equal to the test position.

### empty()
Return true if the position is empty

### to(dest, distance)
Calculate the position that sits between the destination Pos for the given distance.

*/
var Pos = GeoJS.Pos = function(p1, p2, radius) {
    // if the first parameter is a string, then parse the value
    if (p1 && p1.split) {
        var coords = p1.split(reDelimitedSplit);
        
        if (coords.length > 1) {
            p1 = coords[0];
            p2 = coords[1];
        } // if
    }
    // otherwise if a position has been passed to the position, then 
    // we will create a new position as a copy of that position
    else if (p1 && p1.lat) {
        p2 = p1.lon || p1.lng; // convert from the alternative format 
        p1 = p1.lat;
    } // if..else
    
    // initialise the position
    this.lat = parseFloat(p1 || 0);
    this.lon = parseFloat(p2 || 0);
    this.radius = radius || KM_PER_RAD;
};

Pos.prototype = {
    constructor: Pos,

    // adapted from: http://www.movable-type.co.uk/scripts/latlong.html
    bearing: function(target) {
        var lat1 = this.lat * DEGREES_TO_RADIANS,
            lat2 = target.lat * DEGREES_TO_RADIANS,
            dlon = (target.lon - this.lon) * DEGREES_TO_RADIANS,
            y = Math.sin(dlon) * Math.cos(lat2),
            x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(dlon),
            brng = Math.atan2(y, x);

        return (brng * RADIANS_TO_DEGREES + 360) % 360;        
    },
    
    // return the serializable clean version of the data
    clean: function() {
        return this.toString();
    },
    
    copy: function() {
        return new Pos(this.lat, this.lon);
    },
    
    distanceTo: function(pos) {
        if ((! pos) || this.empty() || pos.empty()) {
            return 0;
        } // if
        
        var halfdelta_lat = ((pos.lat - this.lat) * DEGREES_TO_RADIANS) / 2;
        var halfdelta_lon = ((pos.lon - this.lon) * DEGREES_TO_RADIANS) / 2;

        // TODO: find out what a stands for, I don't like single char variables in code (same goes for c)
        var a = Math.sin(halfdelta_lat) * Math.sin(halfdelta_lat) + 
                (Math.cos(this.lat * DEGREES_TO_RADIANS) * Math.cos(pos.lat * DEGREES_TO_RADIANS)) * 
                (Math.sin(halfdelta_lon) * Math.sin(halfdelta_lon)),
            c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // calculate the distance
        return this.radius * c;
    },
    
    equalTo: function(testPos) {
        return testPos && (this.lat === testPos.lat) && (this.lon === testPos.lon);
    },
    
    empty: function() {
        return this.lat === 0 && this.lon === 0;
    },
    
    /**
    ### inArray(testArray)
    */
    inArray: function(testArray) {
        if (testArray) {
            for (var ii = testArray.length; ii--; ) {
                if (this.equalTo(testArray[ii])) {
                    return true;
                } // if
            } // for
        } // if
        
        return false;
    },
    
    /**
    ### offset(latOffset, lonOffset)
    Return a new position which is the original `pos` offset by
    the specified `latOffset` and `lonOffset` (which are specified in 
    km distance)
    */
    offset: function(latOffset, lonOffset) {
        var radOffsetLat = latOffset / this.radius,
            radOffsetLon = lonOffset / this.radius,
            radLat = this.lat * DEGREES_TO_RADIANS,
            radLon = this.lon * DEGREES_TO_RADIANS,
            newLat = radLat + radOffsetLat,
            deltaLon = Math.asin(Math.sin(radOffsetLon) / Math.cos(radLat)),
            newLon = radLon + deltaLon;
           
        // if the new latitude has wrapped, then update
        newLat = ((newLat + HALF_PI) % Math.PI) - HALF_PI;
        newLon = newLon % TWO_PI;
        
        return new Pos(newLat * RADIANS_TO_DEGREES, newLon * RADIANS_TO_DEGREES);
    },
    
    /**
    ## to(bearing, distance)

    Return a new position from the current position based on the provided
    bearing and distance.
    
    (adapted from: http://www.movable-type.co.uk/scripts/latlong.html)
    */
    to: function(bearing, distance) {
        // if the bearing is specified as an object, then assume
        // we have been passed a position so get the bearing
        if (typeof bearing == 'object') {
            bearing = this.bearing(bearing);
        } // if
        
        var radDist = distance / this.radius,
            radBearing = bearing * DEGREES_TO_RADIANS,
            lat1 = this.lat * DEGREES_TO_RADIANS,
            lon1 = this.lon * DEGREES_TO_RADIANS,
            lat2 = Math.asin(Math.sin(lat1) * Math.cos(radDist) + 
                    Math.cos(lat1) * Math.sin(radDist) * Math.cos(radBearing)),
            lon2 = lon1 + Math.atan2(
                    Math.sin(radBearing) * Math.sin(radDist) * Math.cos(lat1), 
                    Math.cos(radDist) - Math.sin(lat1) * Math.sin(lat2)
            );
            
      // normalize the longitude
      lon2 = (lon2+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

      return new Pos(lat2 * RADIANS_TO_DEGREES, lon2 * RADIANS_TO_DEGREES);
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

        // COG.Log.info("rad distance = " + radDist);
        // COG.Log.info("rad lat = " + radLat + ", lon = " + radLon);
        // COG.Log.info("min lat = " + minLat + ", max lat = " + maxLat);

        if ((minLat > MIN_LAT_RAD) && (maxLat < MAX_LAT_RAD)) {
            var deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));

            // determine the min longitude
            minLon = radLon - deltaLon;
            if (minLon < MIN_LON_RAD) {
                minLon += TWO_PI;
            } // if

            // determine the max longitude
            maxLon = radLon + deltaLon;
            if (maxLon > MAX_LON_RAD) {
                maxLon -= TWO_PI;
            } // if
        }
        else {
            minLat = Math.max(minLat, MIN_LAT_RAD);
            maxLat = Math.min(maxLat, MAX_LAT_RAD);
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
    },
    
    /**
    ### valid()
    */
    valid: function() {
        return !(isNaN(this.lat) || isNaN(this.lon));
    }
};
/**
# GeoJS.Line

## Constructor

    new GeoJS.Line(positions);
    
## Methods

### distance()
The distance method is used to return the distance between the 
positions specified in the Line.  A compound value is returned from the 
method in the following form:

    {
        total: 0, // the total distance from the start to end position
        segments: [], // distance segments, 0 indexed. 0 = distance between pos 0 + pos 1
    }
    
### traverse(distance, distData)
This method is used to traverse along the line by the specified distance (in km). The method
will return the position that equates to the end point from travelling the distance.  If the 
distance specified is longer than the line, then the end of the line is returned.  In some
cases you would call this method after a call to the `distance()` method, and if this is the 
case it is best to pass that distance data in the `distData` argument.  If not, this will
be recalculated.

*/
var Line = GeoJS.Line = function(positions) {
    this.positions = [];
    
    // iterate through the positions and if we have text, then convert to a position
    for (var ii = positions.length; ii--; ) {
        if (typeof positions[ii] == 'string') {
            this.positions[ii] = new Pos(positions[ii]);
        }
        // if not a string, then just get a copy of the position passed
        // line functions are non-destructive so a copy is probably best
        // TODO: evaluation whether a copy should be used
        else {
            this.positions[ii] = positions[ii];
        } // if..else
    } // for
};

Line.prototype = {
    constructor: Line,
  
    distance: function() {
        var totalDist = 0,
            segmentDistances = [],
            distance;
        
        // iterate through the positions and return 
        for (var ii = this.positions.length - 1; ii--; ) {
            // calculate the distance between this node and the next
            distance = this.positions[ii].distanceTo(this.positions[ii + 1]);
            
            // update the total distance and segment distances
            totalDist += segmentDistances[ii] = distance;;
        } // for

        // return a distance object
        return {
            total: totalDist,
            segments: segmentDistances
        };
    },
    
    /**
    ## simplify
    
    Simplification routine taken from Max Odgen's geojs-utils library:
    https://github.com/maxogden/geojson-js-utils
    */
    simplify: function(kink) {
        kink = kink || 20;
        
        var source = this.positions,
            n_source, n_stack, n_dest, start, end, i, sig,
            dev_sqr, max_dev_sqr, band_sqr,
            x12, y12, d12, x13, y13, d13, x23, y23, d23,
            index = [], /* aray of indexes of source points to include in the reduced line */
            sig_start = [], /* indices of start & end of working section */
            sig_end = [],
            F = (Math.PI / 180.0) / 2;

        /* check for simple cases */

        if ( source.length < 3 ) return(source);  /* one or two points */

        /* more complex case. initialize stack */

        n_source = source.length;
        band_sqr = kink * 360.0 / (2.0 * Math.PI * 6378137.0);	/* Now in degrees */
        band_sqr *= band_sqr;
        n_dest = 0;
        sig_start[0] = 0;
        sig_end[0] = n_source-1;
        n_stack = 1;

        /* while the stack is not empty  ... */
        while ( n_stack > 0 ){

          /* ... pop the top-most entries off the stacks */

          start = sig_start[n_stack-1];
          end = sig_end[n_stack-1];
          n_stack--;

          if ( (end - start) > 1 ){  /* any intermediate points ? */    

              /* ... yes, so find most deviant intermediate point to
                 either side of line joining start & end points */                   

            x12 = source[end].lon - source[start].lon;
            y12 = source[end].lat - source[start].lat;
            if (Math.abs(x12) > 180.0) 
              x12 = 360.0 - Math.abs(x12);
            x12 *= Math.cos(F * (source[end].lat + source[start].lat));/* use avg lat to reduce lon */
            d12 = (x12*x12) + (y12*y12);

            for ( i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++ ){                  

              x13 = source[i].lon - source[start].lon;
              y13 = source[i].lat - source[start].lat;
              if (Math.abs(x13) > 180.0) 
                x13 = 360.0 - Math.abs(x13);
              x13 *= Math.cos (F * (source[i].lat + source[start].lat));
              d13 = (x13*x13) + (y13*y13);

              x23 = source[i].lon - source[end].lon;
              y23 = source[i].lat - source[end].lat;
              if (Math.abs(x23) > 180.0) 
                x23 = 360.0 - Math.abs(x23);
              x23 *= Math.cos(F * (source[i].lat + source[end].lat));
              d23 = (x23*x23) + (y23*y23);

              if ( d13 >= ( d12 + d23 ) )
                dev_sqr = d23;
              else if ( d23 >= ( d12 + d13 ) )
                dev_sqr = d13;
              else
                dev_sqr = (x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12) / d12;// solve triangle

              if ( dev_sqr > max_dev_sqr  ){
                sig = i;
                max_dev_sqr = dev_sqr;
              }
            }

            if ( max_dev_sqr < band_sqr ){   /* is there a sig. intermediate point ? */
              /* ... no, so transfer current start point */
              index[n_dest] = start;
              n_dest++;
            }
            else{
              /* ... yes, so push two sub-sections on stack for further processing */
              n_stack++;
              sig_start[n_stack-1] = sig;
              sig_end[n_stack-1] = end;
              n_stack++;
              sig_start[n_stack-1] = start;
              sig_end[n_stack-1] = sig;
            }
          }
          else{
              /* ... no intermediate points, so transfer current start point */
              index[n_dest] = start;
              n_dest++;
          }
        }

        /* transfer last point */
        index[n_dest] = n_source-1;
        n_dest++;

        /* make return array */
        var r = [];
        for(i=0; i < n_dest; i++)
          r.push(source[index[i]]);
          
        // update the positions array
        this.positions = r;

        return this;
    },
    
    traverse: function(distance, distData) {
        var elapsed = 0,
            posIdx = 0;
        
        // initialise the distance data if not provided (or invalid)
        if ((! distData) || (! distData.segments)) {
            distData = this.distance();
        } // if
        
        // if the traversal distance is greater than the line distance
        // then return the last position
        if (distance > distData.total) {
            return this.positions[this.positions.length - 1];
        }
        // or, if the distance is negative, then return the first position
        else if (distance <= 0) {
            return this.positions[0];
        }
        // otherwise, calculate the distance
        else {
            // find the position in the 
            while (posIdx < distData.segments.length) {
                elapsed += distData.segments[posIdx];
                
                // if the elapsed distance is greater than the required
                // distance, decrement the index by one and break from the loop
                if (elapsed > distance) {
                    // remove the last distance from the elapsed distance
                    elapsed -= distData.segments[posIdx];
                    break;
                } // if
                
                // increment the pos index
                posIdx++;
            } // while

            // TODO: get the position between this and the next position
            if (posIdx < this.positions.length - 1) {
                var pos1 = this.positions[posIdx],
                    pos2 = this.positions[posIdx + 1],
                    bearing = pos1.bearing(pos2);
                    
                return pos1.to(bearing, distance - elapsed);
            }
            else {
                return this.positions[posIdx];
            } // if..else
        } // if..else
    }
};
var BBox = GeoJS.BBox = function(p1, p2) {
    // if p1 is an array, then calculate the bounding box for the positions supplied
    if (p1 && p1.splice) {
        var padding = p2,
            minPos = new Pos(MAX_LAT, MAX_LON),
            maxPos = new Pos(MIN_LAT, MIN_LON);

        for (var ii = p1.length; ii--; ) {
            var testPos = typeof p1[ii] == 'string' ? new Pos(p1[ii]) : p1[ii];
            
            if (testPos) {
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
            } // if
        } // for
        
        // assign the min and max pos so the size can be calculated
        this.min = minPos;
        this.max = maxPos;
        
        // if the amount of padding is undefined, then calculate
        if (typeof padding == 'undefined') {
            var size = this.size();

            // update padding to be a third of the max size
            padding = Math.max(size.x, size.y) * 0.3;
        } // if

        // update the min and max
        this.min = new Pos(minPos.lat - padding, (minPos.lon - padding) % 360);
        this.max = new Pos(maxPos.lat + padding, (maxPos.lon + padding) % 360);
    }
    else if (p1 && p1.min) {
        this.min = new Pos(p1.min);
        this.max = new Pos(p1.max);
    }
    // otherwise, assign p1 to the min pos and p2 to the max
    else {
        this.min = new Pos(p1);
        this.max = new Pos(p2);
    } // if..else
};

BBox.prototype = {
    constructor: BBox,
    
    /**
    ### bestZoomLevel(viewport)
    */
    bestZoomLevel: function(vpWidth, vpHeight) {
        // get the constant index for the center of the bounds
        var boundsCenter = this.center(),
            maxZoom = 1000,
            variabilityIndex = Math.min(
                Math.round(Math.abs(boundsCenter.lat) * 0.05), 
                LAT_VARIABILITIES.length),
            variability = LAT_VARIABILITIES[variabilityIndex],
            delta = this.size(),
            // interestingly, the original article had the variability included, when in actual reality it isn't, 
            // however a constant value is required. must find out exactly what it is.  At present, though this
            // works fine.
            bestZoomH = Math.ceil(
                Math.log(LAT_VARIABILITIES[3] * vpHeight / delta.y) / Math.LN2),
                
            bestZoomW = Math.ceil(
                Math.log(variability * vpWidth / delta.x) / Math.LN2);

        // _log("constant index for bbox: " + bounds + " (center = " + boundsCenter + ") is " + variabilityIndex);
        // _log("distances  = " + delta);
        // _log("optimal zoom levels: height = " + bestZoomH + ", width = " + bestZoomW);

        // return the lower of the two zoom levels
        return Math.min(
            isNaN(bestZoomH) ? maxZoom : bestZoomH, 
            isNaN(bestZoomW) ? maxZoom : bestZoomW
        );
    },

    /**
    ### center()
    */
    center: function() {
        // calculate the bounds size
        var size = this.size();
        
        // create a new position offset from the current min
        return new Pos(this.min.lat + size.y / 2, this.min.lon + size.x / 2);
    },
    
    /**
    ### contains(lat, lon)
    
    */
    contains: function(lat, lon) {
        // check if the first argument is in fact a position
        if (typeof lat == 'object' && typeof lat.lat != 'undefined') {
            lon = lat.lon;
            lat = lat.lat;
        }
        
        // now check to see if the lat and lon is within the bounds
        return this.min.lat <= lat && 
            this.max.lat >= lat &&
            this.min.lon <= lon && 
            this.max.lon >= lon;
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
        
        // iterate through the arguments and determine the min and max bounds
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
var Distance = GeoJS.Distance = function(value) {
    if (typeof value == 'string') {
        var uom = (value.replace(/\d|\.|\s/g, '') || 'm').toLowerCase(),
            multipliers = {
                km: 1000
            };

        value = parseFloat(value) * (multipliers[uom] || 1);
    } // if
    
    this.meters = value || 0;
};

Distance.prototype = {
    /**
    ### add(args*)
    */
    add: function() {
        var total = this.meters;
        
        for (var ii = arguments.length; ii--; ) {
            var dist = typeof arguments[ii] == 'string' ? 
                        new Distance(arguments[ii]) : arguments[ii];

            total += dist.meters;
        } // for
        
        return new Distance(total);
    },
    
    
    /**
    ### radians(value)
    */
    radians: function(value) {
        // if the value is supplied, then set then calculate meters from radians
        if (typeof value != 'undefined') {
            this.meters = value * M_PER_RAD;
            
            return this;
        }
        // otherwise, return the radians from the meter value
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

module.exports = GeoJS;