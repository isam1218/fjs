(function() {
    /**
     * FDPTransport based on XHRAjax (XMLHTTPRequest)
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @param {string} type Client type
     * @constructor
     * @extends fjs.fdp.transport.AJAXTransport
     */
    fjs.fdp.transport.XHRTransport = function(ticket, node, url, type) {
        fjs.fdp.transport.AJAXTransport.call(this, ticket, node, url, type);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.XHRAjax();
    };
    fjs.core.inherits(fjs.fdp.transport.XHRTransport, fjs.fdp.transport.AJAXTransport);

    /**
     * Sends ajax request use XMLHTTPRequest
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     */
    fjs.fdp.transport.XHRTransport.prototype.sendRequest = function (url, data, callback) {
        if(this.closed) {
            return null;
        }
        if(fjs.utils.Browser.isSafari()) {
            url += (/\?/.test(url) ? '&safariNoCaсhe=' : '?safariNoCaсhe=') + Date.now();
        }
        data = data || {};
        data["t"] = this.type;
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node: this.node || ""};
        var xhr = this.ajax.send('post', url, headers, data, callback);
        xhr.url = url;
        return xhr;
    };
})();
