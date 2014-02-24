/**
 * Ajax provider interface
 * @interface
 */
fjs.ajax.IAjaxProvider = function() {};


/**
 * Aborts request
 * @param {*} transport - Ajax transport
 */
fjs.ajax.IAjaxProvider.prototype.abort = function(transport) {};


/**
 * Sends ajax request
 * @param {string} method - Request method
 * @param {string} url - Request URL
 * @param {*} headers - Request headers
 * @param {*} data - Request data
 * @param {function(*, string, boolean)} callback
 * @return {*}
 */
fjs.ajax.IAjaxProvider.prototype.send = function(method, url, headers, data, callback) {};

