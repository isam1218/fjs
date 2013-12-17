/**
 *   Ajax provider interface
 * @interface
 * @template T
 */
fjs.ajax.IAjaxProvider = function() {};


/**
 * @param {T} transport
 */
fjs.ajax.IAjaxProvider.prototype.abort = function(transport) {};


/**
 * @param {string} method
 * @param {string} url
 * @param {*} headers
 * @param {*} data
 * @param {function(T, string, boolean)} callback
 * @return {T}
 */
fjs.ajax.IAjaxProvider.prototype.send = function(method, url, headers, data, callback) {};

