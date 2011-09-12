function getTileConfig(userId, callback) {
    makeServerRequest(new RUOKRequest(), function(config) {
        var clientName = decartaConfig.clientName.replace(/\:.*/, ':' + (userId || ''));
        
        // reset the tile hosts
        hosts = [];

        // initialise the hosts
        if (config.aliasCount) {
            for (var ii = 0; ii < config.aliasCount; ii++) {
                hosts[ii] = 'http://' + config.host.replace('^(.*?)\.(.*)$', '\1-0' + (ii + 1) + '.\2');
            } // for
        }
        else {
            hosts = ['http://' + config.host];
        } // if..else
        
        callback({
            hosts: hosts,
            clientName: clientName,
            sessionID: currentConfig.sessionID,
            configuration: currentConfig.configuration
        });
    });
} // getTileConfig