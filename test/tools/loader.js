var path = require('path'),
    fs = require('fs'),
    dataPath = path.resolve(__dirname, '../data'),
    addressPath = path.join(dataPath, 'addresses'),
    routesPath = path.join(dataPath, 'routes');

exports.getAddresses = function() {
    var addresses = [],
        files = fs.readdirSync(addressPath);
        
    files.forEach(function(file) {
        addresses.push(JSON.parse(fs.readFileSync(path.join(addressPath, file), 'utf8')));
    });
    
    return addresses;
};

exports.getRoutes = function() {
    var routes = [],
        files = fs.readdirSync(routesPath);
        
    files.forEach(function(file) {
        routes.push(JSON.parse(fs.readFileSync(path.join(routesPath, file), 'utf8')));
    });
    
    return routes;
};