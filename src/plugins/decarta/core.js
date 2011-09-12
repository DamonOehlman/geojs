var ZOOM_MAX = 18,
    ZOOM_MIN = 3,
    REGEX_BUILDINGNO = /^(\d+).*$/,
    REGEX_NUMBERRANGE = /(\d+)\s?\-\s?(\d+)/,
    ROADTYPE_REGEX = null,

    // TODO: I think these need to move to the provider level..
    ROADTYPE_REPLACEMENTS = {
        RD: "ROAD",
        ST: "STREET",
        CR: "CRESCENT",
        CRES: "CRESCENT",
        CT: "COURT",
        LN: "LANE",
        HWY: "HIGHWAY",
        MWY: "MOTORWAY"
    },

    placeFormatters = {
        DEFAULT: function(params) {
            var keys = ["landmark", "municipalitySubdivision", "municipality", "countrySubdivision"];
            var place = "";
        
            for (var ii = 0; ii < keys.length; ii++) {
                if (params[keys[ii]]) {
                    place += params[keys[ii]] + " ";
                } // if
            } // for

            return place;
        } // DEFAULT formatter
    },
    
    lastZoom = null,
    requestCounter = 1,
    header = _formatter(
        "<xls:XLS version='1' xls:lang='en' xmlns:xls='http://www.opengis.net/xls' rel='{4}' xmlns:gml='http://www.opengis.net/gml'>" + 
            "<xls:RequestHeader clientName='{0}' clientPassword='{1}' sessionID='{2}' configuration='{3}' />" + 
            "{5}" + 
        "</xls:XLS>"),
    requestFormatter = _formatter("<xls:Request maximumResponses='{0}' version='{1}' requestID='{2}' methodName='{3}Request'>{4}</xls:Request>"),
    urlFormatter = _formatter('{0}/JSON?reqID={1}&chunkNo=1&numChunks=1&data={2}&responseFormat=JSON'),
    
    Street = function(params) {
        params = params || {};
        params.json = params.json || {};
        
        // initialise variables
        var street = "",
            building = "";
            
        // parse the street
        if (params.json.Street) {
            street = params.json.Street.content ? params.json.Street.content : params.json.Street;
        } // if

        // strip any trailing highway specifiers from the street
        street = (street && street.replace) ? street.replace(/\/\d+$/, "") : "";
        
        // parse the building
        if (params.json.Building) {
            // TODO: suspect name will be involved here possibly also
            if (params.json.Building.number) {
                building = params.json.Building.number;
            } // if
        } // if
        
        return {
            building: building,
            street: street,
            
            calcMatchPercentage: function(input) {
                var fnresult = 0,
                    test1 = normalize(input), 
                    test2 = normalize(street);
                    
                if (params.json.Building) {
                    if (buildingMatch(input, params.json.Building.number.toString())) {
                        fnresult += 0.2;
                    } // if
                } // if
                    
                if (test1 && test2 && T5.wordExists(test1, test2)) {
                    fnresult += 0.8;
                } // if

                return fnresult;
            },
            
            toString: function() {
                if (street) {
                    return (building ? building + " " : "") + street;
                } // if
                
                return "";
            }
        };
    };
    
function parseAddress(address, position) {
    var streetDetails = new Street({
            json: address.StreetAddress
        }),
        regions = [];

    // iterate through the places
    if (address.Place) {
        if (! address.Place.length) {
            address.Place = [address.Place];
        } // if

        for (var ii = address.Place.length; ii--; ) {
            regions[regions.length] = address.Place[ii].content;
        } // for
    } // if

    return {
        building: streetDetails.building,
        street: streetDetails.street,
        regions: regions,
        countryCode: address.countryCode || '',
        postalCode: address.PostalCode || '',
        pos: position
    };
} // parseAddress