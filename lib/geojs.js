(function() {
    
    /* internals */
    
    var definedModules = {},
        reTrim = /^(.*)\s+$/,
        reDots = /\./g;
    
    function define(id) {
        return definedModules[id] = {
            exports: {}
        };
    } // define

    function plugin(input, callback) {
        var plugins = input.split(','),
            requested = [],
            errorMessage = null;
            
        for (var ii = 0; ii < plugins.length; ii++) {
            var pluginId = plugins[ii].replace(reTrim, '$1').replace(reDots, '/');
                
            if (IS_COMMONJS) {
                requested.push(require('./plugins/' + pluginId));
            }
            else {
                requested.push(definedModules[pluginId].exports);
            } // if..else
        } // for

        requested.unshift(errorMessage);

        if (callback) {
            callback.apply(null, requested);
        } // if
    } // plugin
    
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
    function Pos(p1, p2, radius) {
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
            p2 = p1.lon;
            p1 = p1.lat;
        } // if..else
        
        // initialise the position
        this.lat = parseFloat(p1 || 0);
        this.lon = parseFloat(p2 || 0);
        this.radius = radius || KM_PER_RAD;
    } // Pos constructor
    
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
            return pos && (this.lat === testPos.lat) && (this.lon === testPos.lon);
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
                    if (this.equal(testArray[ii])) {
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
        
        // adapted from: http://www.movable-type.co.uk/scripts/latlong.html
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
    function Line(positions) {
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
    } // Line
    
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

    /**
    # GeoJS.BBox
    */
    function BBox(p1, p2) {
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
            this.min = p1;
            this.max = p2;
        } // if..else
    } // BoundingBox
    
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

    /**
    # GeoJS.Distance
    
    ## Methods
    */
    function Distance(value) {
        if (typeof value == 'string') {
            var uom = (value.replace(/\d|\.|\s/g, '') || 'm').toLowerCase(),
                multipliers = {
                    km: 1000
                };
    
            value = parseFloat(value) * (multipliers[uom] || 1);
        } // if
        
        this.meters = value || 0;
    } // Distance
    
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
            
    
        // convert min distance to km
        minDist = (minDist || DEFAULT_GENERALIZATION_DISTANCE) / 1000;
    
        // iterate thorugh the source data and add positions the differ by the required amount to 
        // the result positions
        for (var ii = sourceLen; ii--; ) {
            if (ii === 0) {
                positions.unshift(sourceData[ii]);
            }
            else {
                var include = (! lastPosition) || sourceData[ii].inArray(requiredPositions),
                    posDiff = include ? minDist : lastPosition.distanceTo(sourceData[ii]);
    
                // if the position difference is suitable then include
                if (sourceData[ii] && (posDiff >= minDist)) {
                    positions.unshift(sourceData[ii]);
    
                    // update the last position
                    lastPosition = sourceData[ii];
                } // if
            } // if..else
        } // for
    
        return positions;
    } // generalize

    
    /**
    # GeoJS.Duration
    A Timelord duration is what IMO is a sensible and usable representation of a 
    period of "human-time".  A duration value contains both days and seconds values.
    
    ## Methods
    */
    function Duration(p1, p2) {
        if (typeof p1 == 'number') {
            this.days = p1 || 0;
            this.seconds = p2 || 0;
        }
        else if (typeof p1 != 'undefined') {
            this.days = p1.days || 0;
            this.seconds = p1.seconds || 0;
        } // if..else
    } // Duration
    
    Duration.prototype = {
        /**
        ### add(args*)
        The add method returns a new Duration object that is the value of the current
        duration plus the days and seconds value provided.
        */
        add: function() {
            var result = new Duration(this.days, this.seconds);
            
            // iterate through the arguments and add their days and seconds values to the result
            for (var ii = arguments.length; ii--; ) {
                result.days += arguments[ii].days;
                result.seconds += arguments[ii].seconds;
            } // for
            
            return result;
        },
        
        /**
        ### toString()
        Convert the duration to it's string represenation
        
        __TODO__:
        - Improve the implementation
        - Add internationalization support
        */
        toString: function() {
            // TODO: Im sure this can be implemented better....
            
            var days, hours, minutes, totalSeconds,
                output = '';
                
            if (this.days) {
                output = this.days + ' days ';
            } // if
            
            if (this.seconds) {
                totalSeconds = this.seconds;
    
                // if we have hours, then get them
                if (totalSeconds >= 3600) {
                    hours = ~~(totalSeconds / 3600);
                    totalSeconds = totalSeconds - (hours * 3600);
                } // if
                
                // if we have minutes then extract those
                if (totalSeconds >= 60) {
                    minutes = Math.round(totalSeconds / 60);
                    totalSeconds = totalSeconds - (minutes * 60);
                } // if
                
                // format the result
                if (hours) {
                    output = output + hours + 
                        (hours > 1 ? ' hrs ' : ' hr ') + 
                        (minutes ? 
                            (minutes > 10 ? 
                                minutes : 
                                '0' + minutes) + ' min ' 
                            : '');
                }
                else if (minutes) {
                    output = output + minutes + ' min';
                }
                else if (totalSeconds > 0) {
                    output = output + 
                        (totalSeconds > 10 ? 
                            totalSeconds : 
                            '0' + totalSeconds) + ' sec';
                } // if..else
            } // if
            
            return output;
        }
    };
    
    var parseDuration = (function() {
        // initialise constants
        var DAY_SECONDS = 86400;
        
        // the period regex (the front half of the ISO8601 post the T-split)
        var periodRegex = /^P(\d+Y)?(\d+M)?(\d+D)?$/,
            // the time regex (the back half of the ISO8601 post the T-split)
            timeRegex = /^(\d+H)?(\d+M)?(\d+S)?$/,
            // initialise the duration parsers
            durationParsers = {
                8601: parse8601Duration
            };
            
        /* internal functions */
        
        /*
        Used to convert a ISO8601 duration value (not W3C subset)
        (see http://en.wikipedia.org/wiki/ISO_8601#Durations) into a
        composite value in days and seconds
        */   
        function parse8601Duration(input) {
            var durationParts = input.split('T'),
                periodMatches = null,
                timeMatches = null,
                days = 0,
                seconds = 0;
            
            // parse the period part
            periodRegex.lastIndex = -1;
            periodMatches = periodRegex.exec(durationParts[0]);
            
            // increment the days by the valid number of years, months and days
            // TODO: add handling for more than just days here but for the moment
            // that is all that is required
            days = days + (periodMatches[3] ? parseInt(periodMatches[3].slice(0, -1), 10) : 0);
            
            // parse the time part
            timeRegex.lastIndex = -1;
            timeMatches = timeRegex.exec(durationParts[1]);
            
            // increment the time by the required number of hour, minutes and seconds
            seconds = seconds + (timeMatches[1] ? parseInt(timeMatches[1].slice(0, -1), 10) * 3600 : 0);
            seconds = seconds + (timeMatches[2] ? parseInt(timeMatches[2].slice(0, -1), 10) * 60 : 0);
            seconds = seconds + (timeMatches[3] ? parseInt(timeMatches[3].slice(0, -1), 10) : 0);
    
            return new Duration(days, seconds);
        } // parse8601Duration
    
        return function(duration, format) {
            var parser = durationParsers[format];
            
            // if we don't have a parser for the requested format, then throw an exception
            if (! parser) {
                throw 'No parser found for the duration format: ' + format;
            } // if
            
            return parser(duration);
        };
    })();

    
    var GeoJS = this.GeoJS = {
        Pos: Pos,
        Line: Line,
        BBox: BBox,
        Distance: Distance,
        
        generalize: generalize,
        
        // time types and helpers
        Duration: Duration,
        parseDuration: parseDuration,
        
        define: define,
        plugin: plugin
    };
    
    if (IS_COMMONJS) {
        module.exports = GeoJS;
    } // if
})();