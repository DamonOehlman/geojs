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
                time: TL.parse(instructions[ii].duration, '8601')
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