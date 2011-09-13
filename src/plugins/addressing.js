(typeof module != 'undefined' ? module : GeoJS.define('routing')).exports = (function() {
    
    // a numericesque string - either completely numeric, or a number followed by a single character (e.g. 42A)
    var reNumericesque = /^(\d*|\d*\w)$/;
    
    /* Address prototype */
    
    function Address() {
        this.unit = '';
        this.number = '';
        this.street = '';
        this.regions = [];
        this.countryCode = '';
        this.countryName = '';
        this.postalCode = null;
        
        // iterate through the arguments passed to the address and update members
        for (var ii = 0; ii < arguments.length; ii++) {
            for (var key in arguments[ii]) {
                this[key] = arguments[ii][key];
            } // for
        } // for
    } // Address

    Address.prototype = {
        constructor: Address,

        toString: function() {
            var output = '';

            if (this.building) {
                output += this.building + '\n';
            } // if

            output += this.number ? this.number + ' ' : '';
            output += (this.street || '') + '\n';
            output += this.regions.join(', ') + '\n';

            return output;
        }
    };
    
    /* locale parsers */
    
    var localeParsers = {
        EN: (function() {

            /* internals */

            var regexSeparator = /\s/,
                countryRegexes = {
                    AU: /^AUSTRAL/,
                    US: /(^UNITED\sSTATES|^U\.?S\.?A?$)/
                },
                cleaners = [
                    // remove trailing dots from two letter abbreviations
                    function(input) {
                        return input.replace(/(\w{2})\./g, '$1');
                    },
                
                    // convert shop to a unit format 
                    function(input) {
                        return input.replace(/^\s*SHOP\s?(\d*)\,?\s*/, '$1/');
                    }
                ],
                streetRegexes = [
                    (/^ST(REET)?/),
                    (/^R(OA)?D?/),
                    (/^C(OUR)?T?/),
                    (/^AV?(ENUE)?/),
                    (/^PL?(ACE)?/),
                    (/^L(AN)?E?/),
                    (/^DR?(IVE)?/),
                    (/^W(A)?Y?/)
                ],
                unitRegexes = [
                    (/^(?:\#|APT|APARTMENT)\s?(\d+)/),
                    (/^(\d+)\/(.*)/)
                ];

            /* exports */

            return function(address) {
                var rawParts = splitAddress(address, regexSeparator, cleaners),
                    // extract the unit / apartment number
                    unit = extractUnit(rawParts, unitRegexes),
                    // detect the country using the country regexes
                    country = extractCountry(rawParts, countryRegexes),
                    streetData = extractStreetData(rawParts, streetRegexes);
                    
                return new Address({ 
                    unit: unit,
                    regions: rawParts.join(' ').split(/\,\s?/)
                }, country, streetData);
            }; // EN parser
        })()
    };
    
    /* internals */
    
    function extractCountry(parts, countryRegexes) {
        // iterate through the parts and check against country regexes
        for (var countryKey in countryRegexes) {
            for (var ii = parts.length; ii--; ) {
                if (countryRegexes[countryKey].test(parts[ii])) {
                    // return the country key
                    return {
                        // splice the part from the array
                        countryName: parts.splice(ii, 1)[0],
                        countryCode: countryKey
                    };
                } // if
            } // for
        } // for

        return null;
    } // extractCountry

    function extractStreetData(parts, streetRegexes) {
        
        // This function is used to locate the "best" street part in an address 
        // string.  It is called once a street regex has matched against a part
        // starting from the last part and working towards the front. In terms of
        // what is considered the best, we are looking for the part closest to the
        // start of the string that is not immediately prefixed by a numericesque 
        // part (eg. 123, 42A, etc).
        function locateBestStreetPart(startIndex) {
            var bestIndex = startIndex;

            // if the start index is less than or equal to 0, then return
            for (var ii = startIndex-1; ii >= 0; ii--) {
                // iterate over the street regexes and test them against the various parts
                for (var rgxIdx = 0; rgxIdx < streetRegexes.length; rgxIdx++) {
                    // if we have a match, then process
                    if (streetRegexes[rgxIdx].test(parts[ii]) && parts[ii-1] && (! reNumericesque.test(parts[ii-1]))) {
                        // update the best index and break from the inner loop
                        bestIndex = ii;
                        break;
                    } // if
                } // for
            } // for
            
            return bestIndex;
        } // locateBestStreetPart
        
        // This function is used to extract from the street type match
        // index *back to* the street number and possibly unit number fields.
        // The function will start with the street type, then also grab the 
        // previous field regardless of checks.  Fields will continue to be 
        // pulled in until fields start satisfying numeric checks.  Once 
        // positive numeric checks are firing, those will be brought in as
        // building / unit numbers and once the start of the parts array is
        // reached or we fall back to non-numeric fields then the extraction
        // is stopped.
        function extractStreetParts(startIndex) {
            var index = startIndex,
                streetParts = [],
                numberParts,
                testFn = function() { return true; };
                
            while (index >= 0 && testFn()) {
                var alphaPart = isNaN(parseInt(parts[index], 10));

                if (streetParts.length < 2 || alphaPart) {
                    // add the current part to the street parts
                    streetParts.unshift(parts.splice(index--, 1));
                }
                else {
                    if (! numberParts) {
                        numberParts = [];
                    } // if

                    // add the current part to the building parts
                    numberParts.unshift(parts.splice(index--, 1));

                    // update the test function
                    testFn = function() {
                        var isAlpha = isNaN(parseInt(parts[index], 10));

                        // if we have building parts, then we are looking
                        // for non-alpha values, otherwise alpha
                        return numberParts ? (! isAlpha) : isAlpha;
                    };
                } // if..else
            } // while

            return {
                number: numberParts ? numberParts.join('/') : '',
                street: streetParts.join(' ').replace(/\,/g, '')
            };
        } // startIndex

        // iterate over the street regexes and test them against the various parts
        for (var ii = parts.length; ii--; ) {
            for (var rgxIdx = 0; rgxIdx < streetRegexes.length; rgxIdx++) {
                // if we have a match, then process
                if (streetRegexes[rgxIdx].test(parts[ii])) {
                    return extractStreetParts(locateBestStreetPart(ii));
                } // if
            } // for
        } // for

        return {
            number: '',
            street: ''
        };
    } // extractStreetData
    
    function extractUnit(parts, regexes) {
        var match, rgxIdx, ii;
        
        // iterate over the unit regexes and test them against the various parts
        for (rgxIdx = 0; rgxIdx < regexes.length; rgxIdx++) {
            for (ii = parts.length; ii--; ) {
                match = regexes[rgxIdx].exec(parts[ii]);
                
                // if we have a match, then process
                if (match) {
                    // if we have a 2nd capture group, then replace the item with 
                    // the text of that group
                    if (match[2]) {
                        parts.splice(ii, 1, match[2]);
                    }
                    // otherwise, just remove the element
                    else {
                        parts.splice(ii, 1);
                    } // if..else

                    return match[1];
                } // if
            } // for
        } // for        
        
        return undefined;
    } // extractUnit

    function removeEmptyParts(input) {
        var output = [];
        for (var ii = 0; ii < input.length; ii++) {
            if (input[ii]) {
                output[output.length] = input[ii];
            } // if
        } // for

        return output;
    } // removeEmptyParts
    
    function splitAddress(input, separator, cleaners) {
        input = input.toUpperCase();
        
        // apply the cleaners
        for (var ii = 0; ii < cleaners.length; ii++) {
            input = cleaners[ii].call(null, input);
        } // for
        
        return removeEmptyParts(input.split(separator));
    } // splitAddress
    
    /* exports */
    return {
        parse: function(input, locale) {
            if (typeof input == 'string') {
                var parser = localeParsers[locale] || localeParsers.EN;

                return parser(input);
            }
            else {
                return new Address(input);
            } // if..else
        }
    };
})();