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
    }
};