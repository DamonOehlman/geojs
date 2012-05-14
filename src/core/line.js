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
            totalDist += segmentDistances[ii] = distance;
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