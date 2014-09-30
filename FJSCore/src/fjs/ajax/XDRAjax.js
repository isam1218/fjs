(function() {
  var _XDRAjax =
    /**
     * Represents a cross-domain AJAX request for old IE browsers. <br>
     * It works via <a href="http://msdn.microsoft.com/en-us/library/ie/cc288060(v=vs.85).aspx">XDomainRequest</a> <br>
     * It has significant restrictions, general that you cant get error code from failed request.<br>
     * <b>Singleton</b>
     * @constructor
     * @extends {fjs.ajax.AjaxProviderBase.<XDomainRequest>}
     */
    fjs.ajax.XDRAjax = function() {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
        fjs.ajax.AjaxProviderBase.call(this);
    };
    fjs.core.inherits(_XDRAjax, fjs.ajax.AjaxProviderBase);

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {Object} headers - Request (HTTP) headers
     * @param {Object} data - Request data
     * @param {function(XDomainRequest, string, boolean)} callback - Response handler function
     * @return {XDomainRequest}
     */
    _XDRAjax.prototype.send = function(method, url, headers, data, callback) {
        var xdr = new XDomainRequest();
        xdr._onerror =  xdr.onerror = function(e){
            e = e || window.event;
            var _xdr = e.target || xdr;
            callback(_xdr, _xdr.responseText, false);
        };
        xdr.onload = function(e) {
            e = e || window.event;
            var _xdr = e.target || xdr;
            _xdr.status = 200;
            callback(_xdr, _xdr.responseText, true);
        };
        xdr.onprogress = function(e){
            e = e || window.event;
            fjs.utils.Console.log(e);
        };

        xdr.ontimeout = function() {
            fjs.utils.Console.error('timeout');
        };

        xdr.timeout = 3*60*1000;
        if(headers) {
            var keys = Object.keys(headers);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                url += (/\?/.test(url) ? '&' : '?') + key + "=" + encodeURIComponent(headers[key]);
            }
        }
        xdr.open(method, url);
        xdr.send(this.getParamData(data));
        return xdr;
    };

    /**
     * Aborts request
     * @param {XDomainRequest} xdr - Request to abort
     */
    _XDRAjax.prototype.abort = function(xdr) {
        xdr['aborted'] = true;
        xdr.status = 0;
        xdr.abort();
        xdr._onerror({target:xdr});
    };
})();
