var BBox = GeoJS.BBox = function(p1, p2) {
    var lat1 = MAX_LAT, 
        lon1 = MAX_LON,
        lat2 = MIN_LAT,
        lon2 = MIN_LON;
        
    // ensure the constructor has been called
    if (!(this instanceof BBox)) return new BBox(p1, p2);
    
    // if p1 is an array, then calculate the bounding box for the positions supplied
    if (p1 && p1.splice) {
        var padding = p2 || 0;
        
        for (var ii = p1.length; ii--; ) {
            var testPos = typeof p1[ii] == 'string' ? new Pos(p1[ii]) : p1[ii];
            
            if (testPos) {
                if (testPos.lat < lat1) {
                    lat1 = testPos.lat;
                } // if

                if (testPos.lat > lat2) {
                    lat2 = testPos.lat;
                } // if

                if (testPos.lon < lon1) {
                    lon1 = testPos.lon;
                } // if

                if (testPos.lon > lon2) {
                    lon2 = testPos.lon;
                } // if
            } // if
        } // for
        
        /*
        REMOVED: This is very unexpected functionality :/
        // if the amount of padding is undefined, then calculate
        if (typeof padding == 'undefined') {
            var size = this.size();

            // update padding to be a third of the max size
            padding = Math.max(size.x, size.y) * 0.3;
        } // if
        */

        // update the min and max
        lat1 = lat1 - padding;
        lon1 = (lon1 - padding) % 360;
        lat2 = lat2 + padding;
        lon2 = (lon2 + padding) % 360;
    }
    else if (p1 && p1.min) {
        lat1 = p1.min.lat;
        lon1 = p1.min.lon;
        lat2 = p1.max.lat;
        lon2 = p1.max.lon;
    }
    // otherwise, assign p1 to the min pos and p2 to the max
    else {
        lat1 = p1.lat;
        lon1 = p1.lng || p1.lon;
        lat2 = p2.lat;
        lon2 = p2.lng || p2.lon;
    } // if..else
    
    // ensure the min and max are properly normalized
    this.min = new Pos(Math.min(lat1, lat2), Math.min(lon1, lon2));
    this.max = new Pos(Math.max(lat1, lat2), Math.max(lon1, lon2));
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