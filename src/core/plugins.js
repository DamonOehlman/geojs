function define(id, definition) {
    
} // define

function include(input, callback) {
    var plugins = input.split(','),
        pluginName;
        
    for (var ii = 0; ii < plugins.length; ii++) {
        var pluginFile = plugins[ii].trim().replace('.', '/'),
            plugin;
        
        if (! pluginsLoaded[pluginFile]) {
            if (IS_COMMONJS) {
                plugin = require('./plugins/' + pluginFile);
            } // if
            
            // TODO: add $LABjs loading here also

            // iterate through the plugin and add members to GeoJS
            for (var key in plugin) {
                GeoJS[key] = plugin[key];
            } // for
            
            // flag the plugin as loaded
            pluginsLoaded[pluginFile] = true;
        }    
    } // for
    
    if (IS_COMMONJS && callback) {
        callback(GeoJS);
    } // if
    
    return GeoJS;
} // include