(function() {
  namespace('fjs.ajax');

  var _a =
  /**
  * Represents AJAX requests based on <a href="http://en.wikipedia.org/wiki/XMLHttpRequest">XMLHTTPRequest</a> <br>
  * <b>Singleton</b>
  * @constructor
  * @implements {fjs.ajax.IAjaxProvider.<XMLHttpRequest>}
  */
  fjs.ajax.XHRAjax = function() {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
    };



    /**
     * XHR States
     * @enum {number}
     */
    fjs.ajax.XHRAjax.states = {
        /**
         * request not initialized
         */
        REQUEST_NOT_INITIALIZED: 0,
        /**
         * server connection established
         */
        REQUEST_CONNECTION_ESTABLISHED: 1,
        /**
         * request received
         */
        REQUEST_RECEIVED: 2,
        /**
         * processing request
         */
        REQUEST_PROCESSING: 3,
        /**
         * request finished and response is ready
         */
        REQUEST_COMPLETED: 4
    };

    /**
     * Returns instance of XMLHTTPRequest
     * @return {XMLHttpRequest}
     * @private
     */
    fjs.ajax.XHRAjax.prototype.getXmlHttp = function() {
        /**
         * @type {XMLHttpRequest}
         */
        var xmlhttp;
        try {
            xmlhttp = new XMLHttpRequest();
        }
        catch (e) {
            try {
                xmlhttp = ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e1) {
                try {
                    xmlhttp = ActiveXObject('Microsoft.XMLHTTP');
                } catch (e2) {
                    xmlhttp = null;
                }
            }
        }
        return xmlhttp;
    };

    /**
     * Prepares request data
     * @param {Object} data
     * @return {string}
     * @private
     */
    fjs.ajax.XHRAjax.prototype.getParamData = function(data) {
        var paramStrings = [], i;
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                paramStrings.push(i + '=' + data[i]);
            }
        }
        return paramStrings.join('&');
    };

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {Object} headers - Request (HTTP) headers
     * @param {Object} data - Request data
     * @param {function(XMLHttpRequest, string, boolean)} callback
     * @return {XMLHttpRequest}
     */
    fjs.ajax.XHRAjax.prototype.send = function(method, url, headers, data, callback) {

        var xmlhttp = this.getXmlHttp(), key;

        xmlhttp.open(method, url);

        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        if (headers) {
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xmlhttp.setRequestHeader(key, headers[key]);
                }
            }
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState !== _a.states.REQUEST_COMPLETED) return;

            if (callback) {
                try {
                    if (xmlhttp.status === 200) {
                        callback(xmlhttp, xmlhttp.responseText, true);
                    }
                    else {
                        callback(xmlhttp, xmlhttp.responseText, false);
                    }
                }
                catch (e) {
                    callback({"status":0, responseText:"", aborted:true}, "", false);
                }
            }
        };

        xmlhttp.send(this.getParamData(data));

        return xmlhttp;
    };

    /**
     * Aborts request
     * @param {XMLHttpRequest} xhr
     */
    fjs.ajax.XHRAjax.prototype.abort = function(xhr) {
        if (xhr && xhr.readyState !== _a.states.REQUEST_COMPLETED) {
            xhr['aborted'] = true;
            xhr.abort();
        }
    };
})();
