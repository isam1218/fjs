(function() {
    namespace('fjs.ajax');
    /**
     * <a href="http://msdn.microsoft.com/en-us/library/ie/cc288060(v=vs.85).aspx">XDomainRequest</a> wrapper class
     * @constructor
     * @implements {fjs.ajax.IAjaxProvider.<XDomainRequest>}
     */
    fjs.ajax.XDRAjax = function() {
        //Singleton
        if (!this.constructor.__instance)
            /**
             * @type {fjs.ajax.XDRAjax}
             * @private
             */
            this.constructor.__instance = this;
        else return this.constructor.__instance;
    };

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {*} headers - Request (HTTP) headers
     * @param {*} data - Request data
     * @param {function(XDomainRequest, string, boolean)} callback
     * @return {XDomainRequest}
     */
    fjs.ajax.XDRAjax.prototype.send = function(method, url, headers, data, callback) {
        var xdr = new XDomainRequest();
        xdr.onerror = function(e){
            e = e || window.event;
            var _xdr = e.target || xdr;
            callback(_xdr, _xdr.responseText, false);
        };
        xdr.onload = function(e) {
            e = e || window.event;
            var _xdr = e.target || xdr;
            _xdr["status"] = 200;
            callback(_xdr, _xdr.responseText, true);
        };
        for(var key in headers) {
            if(headers.hasOwnProperty(key)) {
                url += (/\?/.test(url) ? '&' : '?') + key + "=" + headers[key];
            }
        }
        xdr.open(method, url);
        xdr.send(data);
        return xdr;
    };
    /**
     * Aborts request
     * @param {XDomainRequest} xdr - Request to abort
     */
    fjs.ajax.XDRAjax.prototype.abort = function(xdr) {
        xdr['aborted'] = true;
        xdr.abort();
    };
})();