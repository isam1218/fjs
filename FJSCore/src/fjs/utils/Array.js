namespace("fjs.utils");
/**
 * Utils static class to simplify work with Array.
 * @constructor
 */
fjs.utils.Array = function(){};

/**
 * Checks if object is Array
 * @param {*} obj
 * @returns {boolean}
 * @static
 */
fjs.utils.Array.isArray = function(obj) {
    return Array.isArray(obj) ||
        (typeof obj === 'object' && obj+"" === '[object Array]');
};