(function() {
    namespace("fjs.fdp");
    /**
     * FDPTransport based on XDRAjax (XDomainRequest)
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @constructor
     * @extends fjs.fdp.transport.AJAXTransport
     */

    fjs.fdp.transport.XDRTransport = function(ticket, node, url, type) {
        fjs.fdp.transport.AJAXTransport.call(this, ticket, node, url, type);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.XDRAjax();
        this.iframeAjax = new fjs.ajax.IFrameAjax();
    };
    fjs.fdp.transport.XDRTransport.extend(fjs.fdp.transport.AJAXTransport);

    /**
     * Sends ajax request use XDomainRequest
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     */
    fjs.fdp.transport.XDRTransport.prototype.sendRequest = function (url, data, callback) {
        var context = this;
        if(this.closed) {
            return null;
        }
        data["t"] = this.type;
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node:this.node};
        var xdr = this.ajax.send('post', url, headers, data, function(request, responseText, isOK){
            if(!isOK) {
                context.iframeAjax.send('post', url, headers, data, callback);
            }
            else {
                callback.apply(this, arguments);
            }
        });
        xdr.url = url;
        return url;
    };
})();