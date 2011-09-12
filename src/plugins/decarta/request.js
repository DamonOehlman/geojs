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

// RUOK Request

function RUOKRequest() {
    Request.call(this, 'RUOK');
} // RUOKRequest

RUOKRequest.prototype = new Request();
RUOKRequest.constructor = RUOKRequest;

RUOKRequest.parseResponse = function(response) {
    return [{
        aliasCount: response.maxHostAliases,
        host: response.hostName
    }];
};

// request functions

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