
(function(scope) {
    
    /* define some helpers */
    
    var gmlHelpers = {
            coords: function(coords, eastingFirst) {
                var output = [];
                
                // output the coordinates
                for (var ii = 0, coordCount = coords.length; ii < coordCount; ii++) {
                    var coord = new GeoJS.Pos(coords[ii]);
                    output[output.length] = eastingFirst ? 
                        (coord.lon + ',' + coord.lat) : 
                        (coord.lat + ',' + coord.lon);
                } // for
                
                return '<gml:coordinates>' + output.join(' ') + '</gml:coordinates>';
            },
        
            box: function(min, max, eastingFirst) {
                return '<gml:Box>' + gmlHelpers.coords([min, max], eastingFirst) + '</gml:Box>';
            }
        },
        ogcHelpers = {
            propName: function(property) {
                return '<ogc:PropertyName>' + property + '</ogc:PropertyName>';
            }
        };
    
    /* define the OGC conversion functions */
    
    function bboxOGC(args, params) {
        return '' + 
            '<ogc:BBOX>' + 
              ogcHelpers.propName(args.property) + 
              gmlHelpers.box(args.min, args.max, params.eastingFirst) +
            '</ogc:BBOX>';
    } // bboxOGC
    
    function likeOGC(args, params) {
        var matchCase = false;
        if (typeof args.matchCase != 'undefined' && args.matchCase) {
            matchCase = true;
        } // if
        
        return '' + 
            '<ogc:PropertyIsLike wildCard="*" singleChar="?" escapeChar="\\" matchCase="' + matchCase + '">' + 
                ogcHelpers.propName(args.property) + 
                '<ogc:Literal>*' + args.value + '*</ogc:Literal>' + 
            '</ogc:PropertyIsLike>';
    } // likeOGC
    
    function compoundOGC(args, param) {
        return '';
    } // compoundOGC
    
    
    /* internals */
    
    var filterSpecs = {
            bbox: {
                req: ['property', 'min', 'max']
            },
        
            like: {
                req: ['property', 'value'],
                opt: ['matchCase']
            },
        
            compound: {
                req: ['operator', 'conditions'] 
            }
        },
        ogcBuilders = {
            bbox: bboxOGC,
            like: likeOGC,
            compound: compoundOGC
        };

    function validate(conditions) {
        // iterate through the conditions and check that we know about them
        for (var ii = 0; ii < conditions.length; ii++) {
            var condition = conditions[ii],
                type = condition.type;
            
            if (! filterSpecs[type]) {
                return 'Unknown condition type: ' + type;
            }
            else if (! condition.args) {
                return 'No arguments for condition: ' + type;
            }
            else {
                var reqArgs = filterSpecs[type].req;
                
                // iterate through the required args
                for (var argIdx = 0; argIdx < reqArgs.length; argIdx++) {
                    var argName = reqArgs[argIdx];
                    
                    if (! condition.args[argName]) {
                        return 'Could not find required argument "' + argName + '" for condition: ' + type;
                    } // if
                } // for
            }
        } // for
        
        return undefined;
    } // validate
    
    /* exports */
    
    function parse(conditions) {
        conditions = JSON.parse(conditions);
        
        // firstly validate the filter
        var validationError = validate(conditions);

        if (validationError) {
            throw new Error(validationError);
        } // if
        
        return conditions;
    } // parse
    
    function toOGC(conditions, params) {
        var filter = '';
        
        // iterate through the conditions, and execute each of the ogc builders
        for (var ii = 0; ii < conditions.length; ii++) {
            filter += ogcBuilders[conditions[ii].type](conditions[ii].args, params);
        } // for
        
        return '<ogc:Filter>' + filter + '</ogc:Filter>';
    } // toOGC
    
    scope.Filters = {
        parse: parse,
        toOGC: toOGC
    };
})(typeof module != 'undefined' && module.exports ? module.exports : GeoJS);