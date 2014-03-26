(function() {
    namespace('fjs.ajax');

    /**
     * Wrapper class for XMLHTTPRequest to work via iframe. <br>
     * Inner class only for internal usage.<br>
     * THIS LINE IS TEST UPDATE TO TEST REVIEW cycle for this code.
     * THIS LINE IS SECOND TEST UPDATE TO TEST REVIEW cycle for this code.
     * @param {string} id Request id. ID for synchronization requests between page and iframe.
     * @constructor
     * @inner
     */
    fjs.ajax.IFrameRequest = function(id) {
        /**
         * Request id
         * @type {string}
         */
        this.id = id;
        /**
         * Request status
         * @type {number}
         */
        this.status = 0;
        /**
         * Response text
         * @type {string}
         */
        this.responseText = "";
        /**
         * Request method {'get'/'post'}
         * @type {string}
         */
        this.method = null;
        /**
         * Request url
         * @type {string}
         */
        this.url = null;
        /**
         * Request data (map key:value)
         * @type {Object}
         */
        this.postData = null;
        /**
         * Request headers (map key:value)
         * @type {Object}
         */
        this.headers = null;
    };

    var _a =
    /**
     * Represents a cross-domain AJAX request via iframe.<br>
     * Old IE browsers don't allow to make cross-domain requests.<br>
     * To circumvent this restriction we load to iframe the special page form other domain.<br>
     * This page makes same-domain requests. To communicate with this page (say what we want to send) we use postMessage.<br>
     * <b>Singleton</b>
     * @param {string} host Cross domain iframe url
     * @constructor
     * @implements {fjs.ajax.IAjaxProvider.<fjs.ajax.IFrameRequest>}
     */
     fjs.ajax.IFrameAjax = function(host) {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
        var context = this;
        /**
         * Cross domain iframe url
         * @type {string}
         * @private
         */
        this.host = host;
        /**
         * @type {HTMLElement}
         * @private
         */
        this.status = _a.states.NOT_INITIALIZED;

         /**
          * @type {Array.<Object>}
          * @private
          */
        this.suspendRequestes = [];

         /**
          * @type {Object}
          * @private
          */
        this.listeners = {};

         /**
          * @type {Object}
          * @private
          */
         this.requests = {};

         /**
          * @type {HTMLElement}
          * @private
          */
        this.crdmnFrame = document.getElementById('crdmnFrame');

        if(!this.crdmnFrame) {
            this.status = _a.states.INITIALIZATION;
            this.crdmnFrame = document.createElement('iframe');
            this.crdmnFrame.name = this.crdmnFrame.id = 'crdmnFrame';
            this.crdmnFrame.src = this.host;
            this.crdmnFrame.onload = function() {
                context.status = _a.states.READY;
                for(var i=0; i<context.suspendRequestes.length; i++) {
                    context.send(null, null, null, null, null, context.suspendRequestes[i]);
                }
            };
            document.body.appendChild(this.crdmnFrame);
            if(window.addEventListener)
            {
                window.addEventListener ("message", function(e){context.onResponse(e);}, false);
            } else {
                if(window.attachEvent) {
                    window.attachEvent("onmessage", function(e){context.onResponse(e);});
                }
            }
        }
        else {
            context.status = _a.states.READY;
        }
    };

    /**
     * @enum {number}
     * @private
     */
    fjs.ajax.IFrameAjax.states = {
        'NOT_INITIALIZED':-1,
        'INITIALIZATION':0,
        'READY':1
    };

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {Object} headers - Request (HTTP) headers
     * @param {Object} data - Request data
     * @param {function(fjs.ajax.IFrameRequest, string, boolean)} callback Request handler function
     * @param {fjs.ajax.IFrameRequest=} request Internal parameter. Should be null for external call.
     * @return {fjs.ajax.IFrameRequest}
     */
    fjs.ajax.IFrameAjax.prototype.send = function(method, url, headers, data, callback, request) {
        if(!request) {
            request = new fjs.ajax.IFrameRequest(new fjs.utils.Increment().get('IFrameAjaxRequest'));
            request.method = method;
            request.postData = data;
            request.url = url;
            request.headers = headers;
            this.listeners[request.id] = callback;
        }
        if(this.status!=_a.states.READY) {
            this.suspendRequestes.push(request);
        }
        else {
            var message = {type:"send", data:request};
            this.crdmnFrame.contentWindow.postMessage(JSON.stringify(message), '*');
            this.requests[request.id] = request;

        }
        return request;
    };
    /**
     * Aborts request
     * @param {fjs.ajax.IFrameRequest} request Request for abort
     */
    fjs.ajax.IFrameAjax.prototype.abort = function(request) {
        var message = {type:'abort', data:request};
        this.crdmnFrame.contentWindow.postMessage(fjs.utils.JSON.stringify(message), '*');
        request['aborted'] = true;
        request.status = 0;
        if(this.listeners[request.id]) {
            this.listeners[request.id](request, "", false);
        }
        delete this.listeners[request.id];
        delete this.requests[request.id];
    };

    /**
     * @param {MessageEvent} e Post message event
     * @private
     */
    fjs.ajax.IFrameAjax.prototype.onResponse = function(e) {
        var message = fjs.utils.JSON.parse(e.data);
        if(message && message.type == 'IFrameAjaxRequest') {
            var request = message.data;
            var id = request.id;
            /**
             * @type {fjs.ajax.IFrameRequest}
             */
            var _request = this.requests[id];
            if(_request) {
                _request.status = request.status;
                _request.responseText = request.responseText;
                var listener = this.listeners[id];
                if (listener) {
                    if (!request.error) {
                        listener(_request, _request.responseText, true);
                    }
                    else {
                        listener(_request, _request.responseText, false);
                    }
                    delete this.listeners[id];
                }
            }
            delete this.requests[id];
        }
    }
})();