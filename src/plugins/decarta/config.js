// deCarta configuration

var decartaConfig = {
        sessionID: new Date().getTime(),
        server: "http://wsdds3.dz.sv.decartahws.com/openls",
        clientName: "DamonOehlman",
        clientPassword: "ayseb3cgxf58wz7yq288ra87",
        configuration: "global-decarta",
        maxResponses: 25,
        release: "4.4.2sp03",
        tileFormat: "PNG",
        fixedGrid: true,
        useCache: true,
        tileHosts: [],

        // REQUEST TIMEOUT in milliseconds
        requestTimeout: 30000,

        // GEOCODING information
        geocoding: {
            countryCode: "US",
            language: "EN"
        },
    
        routing: {
            rulesFile: 'maneuver-rules'
        }
    };

function applyConfig(newConfig) {
    for (var key in newConfig) {
        config[key] = newConfig[key];
    } // for
} // applyConfig