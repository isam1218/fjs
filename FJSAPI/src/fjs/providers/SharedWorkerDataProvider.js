fjs.core.namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.SharedWorkerDataProvider = function(ticket, node, config, callback) {
    var context =this;
    fjs.api.DataProviderBase.call(this, ticket, node, config);
    this.worker = new SharedWorker("../bower_components/FJSAPI/src/fjs/fdp_shared_worker.js");
    this.worker.port.addEventListener("message", function(e) {
        if(e.data["eventType"]=="ready") {
            context.sendMessage({action:'init', data:{ticket:context.ticket, node:context.node, config:context.config}});
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
fjs.core.inherits(fjs.api.SharedWorkerDataProvider, fjs.api.DataProviderBase);
/**
 * @returns {boolean}
 */
fjs.api.SharedWorkerDataProvider.check = function() {
    return  !!self.SharedWorker && !fjs.utils.Browser.isSafari();
};
