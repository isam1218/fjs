(function(){
var _IFrameRequest =
/**
 * Wrapper class for XMLHTTPRequest to work via iframe. <br>
 * Inner class only for internal usage.<br>
 * @param {string} id Request id. ID for synchronization requests between page and iframe.
 * @constructor
 * @inner
 */
  fjs.ajax.IFrameRequest = function(id) {
    /**
     * Request id
     * @type {string}
     */
    this.id = id;
    /**
     * Request status
     * @type {number}
     */
    this.status = 0;
    /**
     * Response text
     * @type {string}
     */
    this.responseText = "";
    /**
     * Request method {'get'/'post'}
     * @type {string}
     */
    this.method = null;
    /**
     * Request url
     * @type {string}
     */
    this.url = null;
    /**
     * Request data (map key:value)
     * @type {Object}
     */
    this.postData = null;
    /**
     * Request headers (map key:value)
     * @type {Object}
     */
    this.headers = null;
  };
_IFrameRequest.prototype.abort = function(){};
})();
