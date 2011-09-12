(typeof module != 'undefined' ? module : GeoJS.define('routing')).exports = (function() {
    function clean(input, accuracy) {
        // if we have no input, then return
        if (! input) { return undefined; }

        // if the input has a clean method, then call it
        if (input.clean) {
            return input.clean(accuracy);
        } // if
        
        // if the input is an array, then clean each item
        if (typeof input == 'object' && input.length) {
            var output = [];
            for (var ii = input.length; ii--; ) {
                output[ii] = input[ii].clean ? input[ii].clean(accuracy) : input[ii];
            } // for
            
            return output;
        } // if
        
        return undefined;
    } // clean
    
    return {
        clean: clean
    };
})();