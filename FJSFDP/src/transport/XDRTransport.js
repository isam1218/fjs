(function() {
    namespace("fjs.fdp");
    /**
     * @constructor
     * @extends fjs.fdp.AJAXTransport
     */
    fjs.fdp.XDRTransport = function(ticket, node, url) {
        fjs.fdp.AJAXTransport.call(this, ticket, node, url);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.XDRAjax();
        this.iframeAjax = new fjs.ajax.IFrameAjax();
    };
    fjs.fdp.XDRTransport.extend(fjs.fdp.AJAXTransport);

    /**
     * @param url
     * @param data
     * @param callback
     */
    fjs.fdp.XDRTransport.prototype.sendRequest = function (url, data, callback) {
        var context = this;
        if(this.closed) {
            return null;
        }
        data["t"] = "web";
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node:this.node};
        return this.ajax.send('post', url, headers, data, function(request, responseText, isOK){
            if(!isOK) {
                context.iframeAjax.send('post', url, headers, data, callback);
            }
            else {
                callback.apply(this, arguments);
            }
        });
    };
})();