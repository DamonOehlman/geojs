var reAlias = /^(.*?)\.(.*)$/;

function getTileConfig(userId, callback) {
    makeServerRequest(new RUOKRequest(), function(config) {
        var clientName = decartaConfig.clientName.replace(/\:.*/, ':' + (userId || '')),
            aliases = config.maxHostAliases || config.aliasCount,
            hostName = config.hostName || config.host,
            hosts = [];
        
        // initialise the hosts
        if (aliases) {
            for (var ii = 0; ii < aliases; ii++) {
                hosts[ii] = 'http://' + hostName.replace(reAlias, '$1-0' + (ii + 1) + '.$2');
            } // for
        }
        else {
            hosts = ['http://' + hostName];
        } // if..else
        
        callback({
            hosts: hosts,
            clientName: clientName,
            sessionID: decartaConfig.sessionID,
            configuration: decartaConfig.configuration
        });
    });
} // getTileConfig