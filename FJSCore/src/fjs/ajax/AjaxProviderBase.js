(function() {
  var _AjaxProviderBase =
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
  _AjaxProviderBase.prototype.abort = function(transport) {};

  /**
   * Sends ajax request
   * @param {string} method - Request method
   * @param {string} url - Request URL
   * @param {Object} headers - Request headers
   * @param {Object} data - Request data
   * @param {function(T, string, boolean)} callback - Response handler
   * @return {T}
   */
  _AjaxProviderBase.prototype.send = function(method, url, headers, data, callback) {};


  /**
   * Prepares request data
   * @param {Object} data - Not formatted request data
   * @returns {string}
   * @protected
   */
  _AjaxProviderBase.prototype.getParamData = function(data) {
      var paramStrings = [], keys = Object.keys(data);
      for (var i=0; i<keys.length; i++) {
          var key = keys[i];
          paramStrings.push(key + '=' + data[key]);
      }
      return paramStrings.join('&');
  };
})();

