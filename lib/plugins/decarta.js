(typeof module != 'undefined' ? module : GeoJS.define('routing')).exports = (function() {

    function _log(msg, level) {
        if (typeof console !== 'undefined') {
            console[level || 'log'](msg);
        } // if
    } // _log
    
    function _logError(error) {
        if (typeof console !== 'undefined') {
            console.error(error);
            console.log(error.stack);
        } // if
    } // _logError

    /** 
    Lightweight JSONP fetcher - www.nonobstrusive.com
    The JSONP namespace provides a lightweight JSONP implementation.  This code
    is implemented as-is from the code released on www.nonobtrusive.com, as per the
    blog post listed below.  Only two changes were made. First, rename the json function
    to get around jslint warnings. Second, remove the params functionality from that
    function (not needed for my implementation).  Oh, and fixed some scoping with the jsonp
    variable (didn't work with multiple calls).
    
    http://www.nonobtrusive.com/2010/05/20/lightweight-jsonp-without-any-3rd-party-libraries/
    */
    var _jsonp = (function(){
        var counter = 0, head, query, key;
        
        function load(url) {
            var script = document.createElement('script'),
                done = false;
            script.src = url;
            script.async = true;
     
            script.onload = script.onreadystatechange = function() {
                if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                    done = true;
                    script.onload = script.onreadystatechange = null;
                    if ( script && script.parentNode ) {
                        script.parentNode.removeChild( script );
                    }
                }
            };
            if ( !head ) {
                head = document.getElementsByTagName('head')[0];
            }
            head.appendChild( script );
        } // load
        
        function clientReq(url, callback, callbackParam) {
            // apply either a ? or & to the url depending on whether we already have query params
            url += url.indexOf("?") >= 0 ? "&" : "?";
    
            var jsonp = "json" + (++counter);
            window[ jsonp ] = function(data){
                callback(data);
                window[ jsonp ] = null;
                try {
                    delete window[ jsonp ];
                } catch (e) {}
            };
     
            load(url + (callbackParam ? callbackParam : "callback") + "=" + jsonp);
            return jsonp;
        } // clientRect
    
        // TODO: remove the callback, it's not needed usually, just some of the 
        // webservices that I deal with don't respond without the callback parameter
        // set (which is extremely silly, I know)
        function serverReq(url, callback, callbackParam) {
            var request = require('request'),
                requestURI = url + (url.indexOf("?") >= 0 ? "&" : "?") +
                    (callbackParam ? callbackParam : 'callback') + '=cb',
                requestOpts = typeof REQUEST_OPTS != 'undefined' ? REQUEST_OPTS : {};
                   
            // set the uri
            requestOpts.uri = requestURI;
    
            request(requestOpts, function(error, response, body) {
                if (! error) {
                    var cleaned = body.replace(/^.*\(/, '').replace(/\).*$/, '');
    
                    callback(JSON.parse(cleaned));
                }
                else {
                    callback({
                        error: error
                    });
                } // if..else
            });
        } // serverReq
        
        return typeof window != 'undefined' ? clientReq : serverReq;
    }());

    var REGEX_FORMAT_HOLDERS = /\{(\d+)(?=\})/g;
    
    function _formatter(format) {
        var matches = format.match(REGEX_FORMAT_HOLDERS),
            regexes = [],
            regexCount = 0,
            ii;
            
        // iterate through the matches
        for (ii = matches ? matches.length : 0; ii--; ) {
            var argIndex = matches[ii].slice(1);
            
            if (! regexes[argIndex]) {
                regexes[argIndex] = new RegExp('\\{' + argIndex + '\\}', 'g');
            } // if
        } // for
        
        // update the regex count
        regexCount = regexes.length;
        
        return function() {
            var output = format;
            
            for (ii = 0; ii < regexCount; ii++) {
                var argValue = arguments[ii];
                if (typeof argValue == 'undefined') {
                    argValue = '';
                } // if
                
                output = output.replace(regexes[ii], argValue);
            } // for
            
            return output;
        };
    } // _formatter
    
    function _wordExists(string, word) {
        var words = string.split(/\s|\,/);
        for (var ii = words.length; ii--; ) {
            if (string.toLowerCase() == word.toLowerCase()) {
                return true;
            } // if
        } // for
        
        return false;
    } // _wordExists

//! INCLUDE FAILED: timelord!
    
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

    // initialise the request counter
    var requestCounter = 1;
    
    function Request(methodName, opts) {
        // initialise opts
        opts = opts || {};
        
        // initialise members
        this.methodName = methodName || '';
        this.maxResponses = opts.maxResponses || 25;
        this.version = opts.version || '1.0';
        this.requestId = requestCounter++;
    } // Request
    
    Request.prototype.getUrl = function(data) {
        if (! decartaConfig.server) {
            _log("No server configured for deCarta - we are going to have issues", 'warn');
        } // if
        
        return urlFormatter(decartaConfig.server, this.requestId, escape(data));
    }; // getUrl
    
    Request.prototype.getRequestBody = function() {
        return '';
    }; // getRequestBody
    
    Request.prototype.parseResponse = function(response) {
        return [response];
    }; // parseResponse
    
    function generateRequest(request) {
        var requestXML = requestFormatter(
                request.maxResponses,
                request.version,
                request.requestId,
                request.methodName,
                request.getRequestBody()
            );
        
        return header(
            decartaConfig.clientName,
            decartaConfig.clientPassword,
            decartaConfig.sessionID,
            decartaConfig.configuration,
            decartaConfig.release,
            requestXML);
    } // generateRequest
    
    function makeServerRequest(request, callback, errorCallback) {
        var targetUrl = request.getUrl(generateRequest(request));
    
        _log("making request: " + generateRequest(request));
        //_log(targetUrl);
        
        // make the request to the server
        _jsonp(targetUrl, function(data) {
            // get the number of responses received
            var response = data.response.XLS.Response;
            console.log(response);
    
            // if we have one or more responeses, then handle them
            if ((response.numberOfResponses > 0) && response[request.methodName + 'Response']) {
                // parse the response if the handler is assigned
                var responseValues = [];
                if (request.parseResponse) {
                    responseValues = request.parseResponse(response[request.methodName + 'Response']);
                } // if
                
                // if the callback is assigned, then process the parsed response
                if (callback) {
                    callback.apply(null, responseValues);
                } // if
            }
            // otherwise, report the error
            else if (errorCallback) {
                errorCallback('Server returned no responses', data.response);
            } // if..else
        });
    } // openlsComms

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
            for (var ii = 0; ii < address.regions.length; ii++) {
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
    
    /* exports */
    
    function geocode(target, callback, reverse) {
        if (reverse) {
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
    } // geocode

    var RouteRequest = function(waypoints, params) {
        // initialise parameters
        params = params || {};
        params.provideRouteHandle = params.provideRouteHandle || false;
        params.distanceUnit = params.distanceUnit || 'KM';
        params.routeQueryType = params.routeQueryType || 'RMAN';
        params.preference = params.preference || 'Fastest';
        params.rulesFile = params.rulesFile || 'maneuver-rules';
        params.routeInstructions = typeof params.routeInstructions == 'undefined' || params.routeInstructions;
        params.routeGeometry = typeof params.routeGeometry == 'undefined' || params.routeGeometry;
        
        
        // define the base request
        var routeHeaderFormatter = _formatter('<xls:DetermineRouteRequest provideRouteHandle="{0}" distanceUnit="{1}" routeQueryType="{2}">'),
            waypointFormatter = _formatter('<xls:{0}><xls:Position><gml:Point><gml:pos>{1}</gml:pos></gml:Point></xls:Position></xls:{0}>'),
            routeInsFormatter = _formatter('<xls:RouteInstructionsRequest rules="{0}" providePoint="true" />');
        
        function parseInstructions(instructionList) {
            var fnresult = [],
                instructions = instructionList && instructionList.RouteInstruction ? 
                    instructionList.RouteInstruction : [];
                    
            // T5.log("parsing " + instructions.length + " instructions", instructions[0], instructions[1], instructions[2]);
            for (var ii = 0; ii < instructions.length; ii++) {
                // initialise the time and duration for this instruction
                var distance = instructions[ii].distance;
                    
                fnresult.push({
                    text: instructions[ii].Instruction,
                    latlng: instructions[ii].Point,
                    distance: distance.value + (distance.uom || 'M').toUpperCase(),
                    time: GeoJS.parseDuration(instructions[ii].duration, '8601')
                });
            } // for
            
    
            // T5.log("parsed " + fnresult.length + " instructions", fnresult[0], fnresult[1], fnresult[2]);
            return fnresult;
        } // parseInstructions
        
        // initialise _self
        var _self = new Request('DetermineRoute');
        
        _self.getRequestBody = function() {
            // check that we have some waypoints, if not throw an exception 
            if (waypoints.length < 2) {
                throw new Error("Cannot send RouteRequest, less than 2 waypoints specified");
            } // if
            
            var body = routeHeaderFormatter(params.provideRouteHandle, params.distanceUnit, params.routeQueryType);
                            
            // open the route plan tag
            body += "<xls:RoutePlan>";
                            
            // specify the route preference
            body += "<xls:RoutePreference>" + params.preference + "</xls:RoutePreference>";
            
            // open the waypoint list
            body += "<xls:WayPointList>";
            
            // add the waypoints
            for (var ii = 0; ii < waypoints.length; ii++) {
                // determine the appropriate tag to use for the waypoint
                // as to why this is required, who knows....
                var tagName = (ii === 0 ? "StartPoint" : (ii === waypoints.length-1 ? "EndPoint" : "ViaPoint"));
                
                body += waypointFormatter(tagName, waypoints[ii].toString());
            }
            
            // close the waypoint list
            body += "</xls:WayPointList>";
            
            // TODO: add the avoid list
            
            // close the route plan tag
            body += "</xls:RoutePlan>";
            
            // add the route instruction request
            if (params.routeInstructions) {
                body += routeInsFormatter(params.rulesFile);
            } // if
            
            // add the geometry request
            if (params.routeGeometry) {
                body += "<xls:RouteGeometryRequest />";
            } // if
            
            // close the route request tag
            body += "</xls:DetermineRouteRequest>";
            return body;
        }; // getRequestBody
            
        _self.parseResponse = function(response) {
            // T5.log("received route request response:", response);
            return [
                response.RouteGeometry.LineString.pos,
                parseInstructions(response.RouteInstructionsList)
            ];
        }; // parseResponse
        
        return _self;
    };
    
    /* exports */
    
    GeoJS.plugin('routing', function(err, routing) {
        console.log(routing);
        
        routing.addEngine('decarta', function(waypoints, callback, opts) {
            opts = opts || decartaConfig.routing;
    
            // create the route request, mapping the common opts to decarta opts
            var routeRequest = new RouteRequest(waypoints, opts);
    
            // create the geocoding request and execute it
            makeServerRequest(routeRequest, callback, function(err) {
                console.log('got error: ', arguments);
                callback(err);
            });
        });
    });


    return {
        applyConfig: applyConfig,
        
        geocode: geocode
    };
})();