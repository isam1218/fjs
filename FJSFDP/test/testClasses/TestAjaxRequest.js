/**
 * @constructor
 */
fjs.ajax.TestRequest = function() {
    /**
     * @type {number}
     */
    this.timeoutId = null;
    /**
     * Request id
     * @type {string}
     */
    this.id = null;
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

