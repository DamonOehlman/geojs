var geocodeRequestFormatter = _formatter(
        '<xls:GeocodeRequest>' + 
            '<xls:Address countryCode="{0}" language="{1}">{2}</xls:Address>' + 
        '</xls:GeocodeRequest>'
    ),
    _streetAddressFormatter = _formatter(
        '<xls:StreetAddress>' + 
            '<xls:Building number="{0}" />' + 
            '<xls:Street>{1}</xls:Street>' +
        '</xls:StreetAddress>'
    ),
    placeTypes = ['Municipality', 'CountrySubdivision'];

var GeocodeRequest = function(address, params) {
    params = params || {};
    params.countryCode = params.countryCode || decartaConfig.geocoding.countryCode;
    params.language = params.language || decartaConfig.geocoding.language;
    
    function validMatch(match) {
        return match.GeocodeMatchCode && match.GeocodeMatchCode.matchType !== "NO_MATCH";
    } // validMatch
    
    function parseMatchResult(match) {
        var matchAddress = null;
        var matchPos = null;

        if (match && validMatch(match)) {
            // if the point is defined, then convert that to a position
            if (match && match.Point) {
                matchPos = new GeoJS.Pos(match.Point.pos);
            } // if

            // if we have the address then convert that to an address
            if (match && match.Address) {
                matchAddress = parseAddress(match.Address, matchPos);
            } // if
        }
        
        return matchAddress;
    } // parseMatchResult
    
    function getResponseAddresses(responseList) {
        // get the number of responses
        var addresses = [];
        var responseCount = responseList ? responseList.numberOfGeocodedAddresses : 0;
        var matchList = [];
        
        // NOTE: this code has been implemented to compensate for strangeness in deCarta JSON land...
        // see https://github.com/sidelab/T5-closed/wikis/geocoder-json-response for more information
        if (responseCount > 1) {
            matchList = responseList.GeocodedAddress;
        }
        else if (responseCount == 1) {
            matchList = [responseList.GeocodedAddress];
        } // if..else
        
        // iterate through the response list
        for (var ii = 0; matchList && (ii < matchList.length); ii++) {
            var matchResult = parseMatchResult(matchList[ii]);
            if (matchResult) {
                addresses.push(matchResult);
            } // if
        } // for
        
        return addresses;                
    } // getResponseAddresses
                
    // create the request
    var _self = new Request('Geocode');
    
    _self.getRequestBody = function() {
        var addressXML = _streetAddressFormatter(address.number, address.street),
            regions = address.regions && address.regions.join ? address.regions.join(' ') : (address.regions || '');
        
        // iterate through the regions in the parsed street, and add to the address xml
        for (var ii = 0; address.regions && ii < address.regions.length; ii++) {
            if (ii < placeTypes.length) {
                addressXML += '<xls:Place type="' + placeTypes[ii] + '">' + address.regions[ii] + '</xls:Place>';
            } // if
        } // for
        
        // addressXML += '<xls:Place type="Municipality">' + regions + '</xls:Place>';
        
        return geocodeRequestFormatter(
            params.countryCode,
            params.language,
            addressXML);
    }; // getRequestBody
    
    _self.parseResponse = function(response) {
        return [getResponseAddresses(response.GeocodeResponseList)];
    }; // parseResponse\
    
    // return _self
    return _self;
};

var ReverseGeocodeRequest = function(params) {
    params = params || {};
    params.geocodePreference = params.geocodePreference || 'StreetAddress';
    
    var _self = new Request('ReverseGeocode');
    
    _self.getRequestBody = function() {
        return "" +
            "<xls:ReverseGeocodeRequest>" + 
                "<xls:Position>" + 
                    "<gml:Point>" + 
                        "<gml:pos>" + params.position.toString() + "</gml:pos>" + 
                    "</gml:Point>" + 
                "</xls:Position>" + 
                "<xls:ReverseGeocodePreference>" + params.geocodePreference + "</xls:ReverseGeocodePreference>" + 
            "</xls:ReverseGeocodeRequest>";
    }; // getRequestBody
    
    _self.parseResponse = function(response) {
        var matchPos = null;
        
        // if the point is defined, then convert that to a position
        if (response && response.Point) {
            matchPos = new GeoJS.Pos(match.Point.pos);
        } // if

        // if we have the address then convert that to an address
        if (response && response.ReverseGeocodedLocation && response.ReverseGeocodedLocation.Address) {
            return [parseAddress(response.ReverseGeocodedLocation.Address, matchPos)];
        } // if
        
        return [];
    };
    
    return _self;
};

GeoJS.plugin('geocoder', function(err, geocoder) {
    geocoder.addEngine('decarta', function(target, callback, opts) {
        opts = opts || {};
        
        if (opts.reverse) {
            // create the geocoding request and execute it
            var request = new ReverseGeocodeRequest({
                position: target
            });

            makeServerRequest(request, function(matchingAddress) {
                if (callback) {
                    callback(matchingAddress);
                } // if
            });
        }
        else {
            makeServerRequest(new GeocodeRequest(target), function(geocodingResponse) {
                callback(target, geocodingResponse);
            });
        } // if..else
    });
});