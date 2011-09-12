(typeof module != 'undefined' ? module : GeoJS.define('geocoder')).exports = (function() {
    
    var engines = {};
    
    function addEngine(engineId, engineFn) {
        engines[engineId] = engineFn;
    } // addEngine
    
    function getEngine(engineId) {
        var requestedEngine = engines[engineId];
        
        // if we didn't find the engine, then get the first engine in the list
        if (! requestedEngine) {
            if (engines) {
                for (var key in engines) {
                    requestedEngine = engines[key];
                    break;
                } // for
            } // if
        } // if
        
        return requestedEngine;
    } // getEngine
    
    function run(target, callback, opts) {
        // initialise options
        opts = opts || {};
        callback = callback || function() {};
        
        // get the engine
        var engine = getEngine(opts.engine);
        
        // if the engine is defined, then use it
        if (engine) {
            engine(target, callback, opts);
        }
        // otherwise, fire the callback with an error condition
        else {
            callback('Could not locate geocoding service');
        } // if..else        
    } // run
    
    return {
        addEngine: addEngine,
        run: run
    };
})();