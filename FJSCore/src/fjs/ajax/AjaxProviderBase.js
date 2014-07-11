namespace("fjs.ajax");
/**
 * Ajax provider base class
 * @constructor
 * @abstract
 * @template T
 */
fjs.ajax.AjaxProviderBase = function() {};

/**
 * Aborts request
 * @param {T} transport - Ajax transport
 */
fjs.ajax.AjaxProviderBase.prototype.abort = function(transport) {};

/**
 * Sends ajax request
 * @param {string} method - Request method
 * @param {string} url - Request URL
 * @param {Object} headers - Request headers
 * @param {Object} data - Request data
 * @param {function(T, string, boolean)} callback - Response handler
 * @return {T}
 */
fjs.ajax.AjaxProviderBase.prototype.send = function(method, url, headers, data, callback) {};


/**
 * Prepares request data
 * @param {Object} data - Not formatted request data
 * @returns {string}
 * @protected
 */
fjs.ajax.AjaxProviderBase.prototype.getParamData = function(data) {
    var paramStrings = [], i;
    for (i in data) {
        if (data.hasOwnProperty(i)) {
            paramStrings.push(i + '=' + data[i]);
        }
    }
    return paramStrings.join('&');
};

