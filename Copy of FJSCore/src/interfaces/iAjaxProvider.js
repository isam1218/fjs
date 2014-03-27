/**
 * Ajax provider interface
 * @interface
 * @template T
 */
fjs.ajax.IAjaxProvider = function() {};

/**
 * Aborts request
 * @param {T} transport - Ajax transport
 */
fjs.ajax.IAjaxProvider.prototype.abort = function(transport) {};

/**
 * Sends ajax request
 * @param {string} method - Request method
 * @param {string} url - Request URL
 * @param {Object} headers - Request headers
 * @param {Object} data - Request data
 * @param {function(T, string, boolean)} callback
 * @return {T}
 */
fjs.ajax.IAjaxProvider.prototype.send = function(method, url, headers, data, callback) {};

