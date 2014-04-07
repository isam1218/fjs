(function() {
    namespace("fjs.fdp.transport");
    /**
     * FDPTransport based on IFrameAjax
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @param {string} iframeUrl Crossdomain page url
     * @constructor
     * @extends fjs.fdp.transport.AJAXTransport
     */
    fjs.fdp.transport.IFrameTransport = function(ticket, node, url, iframeUrl) {
        fjs.fdp.transport.AJAXTransport.call(this, ticket, node, url);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.IFrameAjax(iframeUrl);
    };
    fjs.fdp.transport.IFrameTransport.extend(fjs.fdp.transport.AJAXTransport);

    /**
     * Sends request use self ajax provider
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     */
    fjs.fdp.transport.IFrameTransport.prototype.sendRequest = function (url, data, callback) {
        if(this.closed) {
            return null;
        }
        data = data || {};
        data["t"] = "web";
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node:this.node};
        return this.ajax.send('post', url, headers, data, callback)
    };
})();