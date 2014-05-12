(function() {
    namespace('fjs.ajax');
    /**
     * Represents a cross-domain AJAX request for old IE browsers. <br>
     * It works via <a href="http://msdn.microsoft.com/en-us/library/ie/cc288060(v=vs.85).aspx">XDomainRequest</a> <br>
     * It has significant restrictions, general that you cant get error code from failed request.<br>
     * <b>Singleton</b>
     * @constructor
     * @implements {fjs.ajax.IAjaxProvider.<XDomainRequest>}
     */
    fjs.ajax.XDRAjax = function() {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
    };

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {Object} headers - Request (HTTP) headers
     * @param {Object} data - Request data
     * @param {function(XDomainRequest, string, boolean)} callback Request handler function
     * @return {XDomainRequest}
     */
    fjs.ajax.XDRAjax.prototype.send = function(method, url, headers, data, callback) {
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
        for(var key in headers) {
            if(headers.hasOwnProperty(key)) {
                url += (/\?/.test(url) ? '&' : '?') + key + "=" + encodeURIComponent(headers[key]);
            }
        }
        xdr.open(method, url);
        xdr.send(this.getParamData(data));
        return xdr;
    };

    fjs.ajax.XDRAjax.prototype.getParamData = function(data) {
        var paramStrings = [], i;
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                paramStrings.push(i + '=' + data[i]);
            }
        }
        return paramStrings.join('&');
    };
    /**
     * Aborts request
     * @param {XDomainRequest} xdr - Request to abort
     */
    fjs.ajax.XDRAjax.prototype.abort = function(xdr) {
        xdr['aborted'] = true;
        xdr.status = 0;
        xdr.abort();
        xdr._onerror({target:xdr});
    };
})();