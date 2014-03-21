(function() {
namespace("fjs.utils");
var _j =
 /**
 * Wrapper for JSON static class.
 * Fixes some JSON issues.
 * @constructor
 * @static
 */
fjs.utils.JSON = function() {};
/**
 * Deserializes json string to object
 * @param {string} str
 * @returns {Object}
 */
fjs.utils.JSON.parse = function(str) {
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
fjs.utils.JSON.check = function(str) {
    var isValid = false;
    try{
        _j.parse(str);
        isValid = true;
    } catch(e){}
    return isValid;
};
    /**
     * Serializes object to json string
     * @param {Object} obj
     * @returns {string}
     */
fjs.utils.JSON.stringify = function(obj) {
    return JSON.stringify(obj);
};
})();
