(function() {
    var _JSON =
     /**
     * Wrapper for native JSON object. <br>
     * Fixes some JSON issues.
     * @constructor
     * @static
     */
    fjs.utils.JSON = function() {};
    /**
     * Deserializes json string to object
     * @param {string} str - String to be parsed
     * @returns {Object}
     */
    _JSON.parse = function(str) {
        var _data = null;
        if(typeof (str) == 'string') {
            try {
                _data = JSON.parse(str);
            }
            catch (e) {
                try {
                    _data = (new Function("return " + str + ";"))();
                }
                catch (e) {
                    throw new Error('Sync data error', e);
                }
            }
        }
        else {
            _data = str;
        }
        return _data;
    };
        /**
         * Checks string for compliance with json string format
         * @param {string} str
         * @returns {boolean}
         */
    _JSON.check = function(str) {
        var isValid = false;
        try{
            _JSON.parse(str);
            isValid = true;
        } catch(e){}
        return isValid;
    };
        /**
         * Serializes object to json string
         * @param {*} obj
         * @returns {string}
         */
    _JSON.stringify = function(obj) {
        if(typeof (obj) == 'string') return obj;
        return JSON.stringify(obj);
    };
        /**
         * Checks if object has no fields.
         * @param {Object} obj
         * @returns {boolean}
         */
    _JSON.isEmpty = function(obj) {
        return Object.keys(obj).length == 0;
    };
})();
