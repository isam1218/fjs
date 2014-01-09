/**
 * @param {number} timeoutId
 * @constructor
 */
fjs.ajax.TestTransport = function(timeoutId) {
    this.timeoutId = timeoutId;
    this.status = 0;
};

fjs.ajax.TestTransport.prototype.setStatus = function(status) {
    this.status = status;
};

/**
 * @constructor
 * @implements fjs.ajax.IAjaxProvider
 */

fjs.ajax.TestAjaxProvider = function() {

};


/**
 * @param {fjs.ajax.TestTransport} transport
 */
fjs.ajax.TestAjaxProvider.prototype.abort = function(transport) {
    clearTimeout(transport.timeoutId);
};


/**
 * @param {string} method
 * @param {string} url
 * @param {*} headers
 * @param {*} data
 * @param {function(fjs.ajax.TestTransport, string, boolean)} callback
 * @return {fjs.ajax.TestTransport}
 */
fjs.ajax.TestAjaxProvider.prototype.send = function(method, url, headers, data, callback) {
    var t = new fjs.ajax.TestTransport(null);
    if(/ClientRegistry/.test(url)) {
        if(headers['Authorization']=='auth=error') {
            t.timeoutId = setTimeout(function(){
                t.setStatus(503);
                callback(t, null, false);
            },100);
        }
        else if(headers['Authorization']!='auth=validTicket') {
            t.timeoutId = setTimeout(function(){
                t.setStatus(403);
                callback(t, null, false);
            },100);
        }
        else {
            t.timeoutId = setTimeout(function(){
                t.setStatus(200);
                var result = "Success\n"
                    + "DB=5770_9bae2f5353d1790bba1f86ab3570f144bd3a704c\n"
                    + "node=node\n"
                    + "db_version=4161404170\n"
                    + "runtime_version=1388123914091\n"
                    + "it= 7\n"
                    + "build= 3.7.0.008796\n";
                callback(t, result, true);
            },100);
        }
    }


    return t;
};

