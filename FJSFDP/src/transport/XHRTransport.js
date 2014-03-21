(function() {
    namespace("fjs.fdp");
    /**
     * @constructor
     * @extends fjs.fdp.AJAXTransport
     */
    fjs.fdp.XHRTransport = function(ticket, node, url) {
        fjs.fdp.AJAXTransport.call(this, ticket, node, url);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.XHRAjax();
    };
    fjs.fdp.XHRTransport.extend(fjs.fdp.AJAXTransport);

    /**
     * @param url
     * @param data
     * @param callback
     */
    fjs.fdp.XHRTransport.prototype.sendRequest = function (url, data, callback) {
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