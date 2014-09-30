(function() {
    var _Array =
    /**
     * Utils static class to simplify work with Array.
     * @constructor
     */
    fjs.utils.Array = function(){};

    /**
     * Checks if object is Array
     * @param {*} obj - Object to be checked
     * @returns {boolean}
     * @static
     */
    _Array.isArray = function(obj) {
        return Array.isArray(obj) ||
            (typeof obj === 'object' && obj+"" === '[object Array]');
    };
})();
