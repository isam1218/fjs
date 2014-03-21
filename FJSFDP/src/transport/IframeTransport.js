(function() {
    namespace("fjs.fdp");
    /**
     * @constructor
     * @extends fjs.fdp.AJAXTransport
     */
    fjs.fdp.IFrameTransport = function(ticket, node, url) {
        fjs.fdp.AJAXTransport.call(this, ticket, node, url);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.IFrameAjax();
    };
    fjs.fdp.IFrameTransport.extend(fjs.fdp.AJAXTransport);

    /**
     * @param url
     * @param data
     * @param callback
     */
    fjs.fdp.IFrameTransport.prototype.sendRequest = function (url, data, callback) {
        if(this.closed) {
            return null;
        }
        data["t"] = "web";
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node:this.node};
        return this.ajax.send('post', url, headers, data, callback)
    };
})();