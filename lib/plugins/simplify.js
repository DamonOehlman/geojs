// Simplification routine taken from Max Odgen's
// geojs-utils library: https://github.com/maxogden/geojson-js-utils

var F = (Math.PI / 180.0) / 2;

/**
simplify(source, kink)

- `source`: the array of points for simplification
- `kink`: in metres, kinks above this depth kept, kink depth is the height of the triangle abc 
  where a-b and b-c are two consecutive line segments
*/
(typeof module != 'undefined' ? module : GeoJS.define('routing')).exports = function(source, kink) {
    /* source[] array of geojson points */
    kink = kink || 20;
    
    // ensure the source array is valid GeoJS.Pos objects
    for (var ii = source.length; ii--; ) {
        if (typeof source[ii] == 'string') {
            source[ii] = new GeoJS.Pos(source[ii]);
        } // if
    } // for

    var n_source, n_stack, n_dest, start, end, i, sig,
        dev_sqr, max_dev_sqr, band_sqr,
        x12, y12, d12, x13, y13, d13, x23, y23, d23,
        index = [], /* aray of indexes of source points to include in the reduced line */
        sig_start = [], /* indices of start & end of working section */
        sig_end = [];	

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
      
    return r;
};