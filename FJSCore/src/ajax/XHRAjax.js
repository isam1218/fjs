(function() {
    namespace('fjs.ajax');


  /**
  * @constructor
  * @implements {fjs.ajax.IAjaxProvider}
  */
  fjs.ajax.XHRAjax = function() {
        //Singleton
        if (!this.constructor.__instance)
            /**
             * @type {fjs.ajax.XHRAjax}
             * @private
             */
            this.constructor.__instance = this;
        else return this.constructor.__instance;
    };

    var a = fjs.ajax.XHRAjax;

    /**
     * XHR States
     * @enum {number}
     */
    fjs.ajax.XHRAjax.states = {
        REQUEST_NOT_INITIALIZED: 0,
        REQUEST_CONNECTION_ESTABLISHED: 1,
        REQUEST_RECEIVED: 2,
        REQUEST_PROCESSING: 3,
        REQUEST_COMPLETED: 4
    };

    /**
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
     * @param {*} data
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
     *
     * @param {string} method
     * @param {string} url
     * @param {*} headers
     * @param {*} data
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
            if (xmlhttp.readyState !== a.states.REQUEST_COMPLETED) return;

            if (callback) {
                if (xmlhttp.status === 200) {
                    callback(xmlhttp, xmlhttp.responseText, true);
                }
                else {
                    callback(xmlhttp, xmlhttp.responseText, false);
                }
            }
        };

        xmlhttp.send(this.getParamData(data));

        return xmlhttp;
    };

    /**
     * @param {XMLHttpRequest} xhr
     */
    fjs.ajax.XHRAjax.prototype.abort = function(xhr) {
        if (xhr && xhr.readyState !== a.states.REQUEST_COMPLETED) {
            xhr['aborted'] = true;
            xhr.abort();
        }
    };
})();
