namespace("fjs.api");

/**
 * Data provider works in the SharedWorker
 * @param {string} ticket - Auth ticket
 * @param {string} node - node Id
 * @param {Function} callback - Data provider ready event handler
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.SharedWorkerDataProvider = function(ticket, node, callback) {
    var context =this;
    fjs.api.DataProviderBase.call(this, ticket, node);
    this.worker = new SharedWorker("js/lib/fdp_shared_worker.js");
    this.worker.port.addEventListener("message", function(e) {
        if(e.data["eventType"]=="ready") {
            context.sendMessage({action:'init', data:{ticket:context.ticket, node:context.node, config:fjs.fdp.CONFIG}});
            callback();
        }
        context.fireEvent(e.data["eventType"], e.data);
    }, false);
    this.worker.port.addEventListener("error", function(e){
        fjs.utils.Console.error("Worker Error", e);
    });
    this.worker.port.start();
    this.sendMessage = function(message) {
        this.worker.port.postMessage(message);
    };
};
fjs.api.SharedWorkerDataProvider.extend(fjs.api.DataProviderBase);

/**
 * Checks provider availability. Returns true if you can use this provider.
 * @returns {boolean}
 */
fjs.api.SharedWorkerDataProvider.check = function() {
    return  !!self.SharedWorker && !fjs.utils.Browser.isSafari() && fjs.utils.Cookies.check();
};
