(function() {
    namespace("fjs.fdp");
    /**
     * @constructor
     * @extends fjs.fdp.AJAXTransport
     */
    fjs.fdp.TestAjaxTransport = function(ticket, node, url) {
        fjs.fdp.TestAjaxTransport.call(this, ticket, node, url);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.XHRAjax();
    };
    fjs.fdp.TestAjaxTransport.extend(fjs.fdp.AJAXTransport);

    /**
     * @param url
     * @param data
     * @param callback
     */
    fjs.fdp.TestAjaxTransport.prototype.sendRequest = function (url, data, callback) {
        if(this.closed) {
            return null;
        }
        if(/ClientRegistry/.test(url)) {
            if (headers['Authorization'] == 'auth=error') {
                t.timeoutId = setTimeout(function () {
                    t.setStatus(503);
                    callback(t, null, false);
                }, 1000);
            }
            else if (headers['Authorization'] != 'auth=validTicket') {
                t.timeoutId = setTimeout(function () {
                    t.setStatus(403);
                    callback(t, null, false);
                }, 1000);
            }
            else {
                t.timeoutId = setTimeout(function () {
                    t.setStatus(200);
                    var result = "Success\n"
                        + "DB=5770_9bae2f5353d1790bba1f86ab3570f144bd3a704c\n"
                        + "node=node\n"
                        + "db_version=4161404170\n"
                        + "runtime_version=1388123914091\n"
                        + "it= 7\n"
                        + "build= 3.7.0.008796\n";
                    callback(t, result, true);
                }, 1000);
            }
        }
    };
})();