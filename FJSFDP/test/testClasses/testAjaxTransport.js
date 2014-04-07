(function() {
    namespace("fjs.fdp");
    /**
     * @constructor
     * @extends fjs.fdp.transport.AJAXTransport
     */
    fjs.fdp.TestAjaxTransport = function(ticket, node, url) {
        fjs.fdp.transport.AJAXTransport.call(this, ticket, node, url);
        this.changes = [
            new fjs.fdp.testModel(2, "qwe", "push")
            , new fjs.fdp.testModel(5, "asd", "push")
        ];
        this.isFullSync = true;
    };
    fjs.fdp.TestAjaxTransport.extend(fjs.fdp.transport.AJAXTransport);

    /**
     * @param url
     * @param data
     * @param callback
     */
    fjs.fdp.TestAjaxTransport.prototype.sendRequest = function (url, data, callback) {
        var context = this;
        if(this.closed) {
            return null;
        }
        var r = new fjs.ajax.TestRequest();
        if(/ClientRegistry/.test(url)) {
            if (this.ticket == 'error') {
                r.timeoutId = setTimeout(function () {
                    r.status = 503;
                    callback(r, null, false);
                }, 100);
            }
            else if (this.ticket != 'validTicket') {
                r.timeoutId = setTimeout(function () {
                    r.status = 403;
                    callback(r, null, false);
                }, 100);
            }
            else {
                r.timeoutId = setTimeout(function () {
                    r.status = 200;
                    var result = "Success\n"
                        + "DB=5770_9bae2f5353d1790bba1f86ab3570f144bd3a704c\n"
                        + "node=node\n"
                        + "db_version=4161404170\n"
                        + "runtime_version=1388123914091\n"
                        + "it= 7\n"
                        + "build= 3.7.0.008796\n";
                    r.responseText = result;
                    callback(r, result, true);
                }, 100);
            }
        }
        if(/versions$/.test(url)) {
            if (this.ticket != 'validTicket' || !this.node) {
                r.timeoutId = setTimeout(function () {
                    r.status = 403;
                    callback(r, null, false);
                }, 100);
            }
            else {
                r.timeoutId = setTimeout(function(){
                    if(data["testFeed"]!==undefined) {
                        r.status = 200;
                        r.responseText = "1395406176143;4143595651;testFeed;;369cf947f441cc867636571f34010542700b0f747a63d7eb162";
                        callback(r, r.responseText, true);
                    }
                }, 100);
            }
        }
        if(/versionscache/.test(url)) {
            if (this.ticket != 'validTicket' || !this.node) {
                r.timeoutId = setTimeout(function () {
                    r.status = 403;
                    callback(r, null, false);
                }, 100);
            }
            else {
                r.timeoutId = setTimeout(function(){
                        r.status = 200;
                        r.responseText = "1395406176143;4143595651;"+(context.changes.length>0 ? "testFeed" : "") +";;369cf947f441cc867636571f34010542700b0f747a63d7eb162";
                        callback(r, r.responseText, true);
                }, 1000);
            }
        }
        if(/sync/.test(url)) {
            if (this.ticket != 'validTicket' || !this.node) {
                r.timeoutId = setTimeout(function () {
                    r.status = 403;
                    callback(r, null, false);
                }, 100);
            }
            else {
                r.timeoutId = setTimeout(function(){
                    if(data["testFeed"]!==undefined) {
                        r.status = 200;
                        var syncResponce = {"testFeed":{
                            "full":context.isFullSync
                            , "0":{
                                "xef001type":context.isFullSync ? "F" : "L"
                                , "items":context.changes
                                , "xef001ver":"0:0:40f7f_329239db:"
                                , "xef001con":"n"
                                , "h_ver":0
                            }
                        }}
                        r.responseText = JSON.stringify(syncResponce);
                        context.changes = [];
                        context.isFullSync = false;
                        callback(r, r.responseText, true);
                    }
                }, 1000);
            }
        }

        if(/testFeed/.test(url)) {
            if(data.action == "create") {
                this.changes.push(new fjs.fdp.testModel(data["a.field1"], data["a.field2"], "push"));
            }
            else if(data.action == "delete") {
                    var p = data["a.pid"].split("_")[1];
                    this.changes.push(new fjs.fdp.testModel(null, null, "delete", p));
            }
            else if(data.action == "update") {
                var p = data["a.pid"].split("_")[1];
                this.changes.push(new fjs.fdp.testModel(data["a.field1"], data["a.field2"], "push", p));
            }
        }
    };
})();
