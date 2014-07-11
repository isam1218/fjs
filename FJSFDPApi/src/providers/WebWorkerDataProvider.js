namespace("fjs.api");

/**
 * Data provider works in the WebWorker
 * @param {string} ticket - Auth ticket
 * @param {string} node - node Id
 * @param {Function} callback - Data provider ready event handler
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.WebWorkerDataProvider = function(ticket, node, callback) {
    var context =this;
    fjs.api.DataProviderBase.call(this, ticket, node);
    this.worker = new Worker("js/lib/fdp_worker.js");
    this.worker.addEventListener("message", function(e) {
        if(e.data["eventType"]=="ready") {
            context.sendMessage({action:'init', data:{ticket:context.ticket, node:context.node, config:fjs.fdp.CONFIG}});
            callback();
        }
        context.fireEvent(e.data["eventType"], e.data);
    }, false);
    this.worker.addEventListener("error", function(e){
        fjs.utils.Console.error("Worker Error", e);
    });
    this.sendMessage = function(message) {
        context.worker.postMessage(message);
    };
};
fjs.api.WebWorkerDataProvider.extend(fjs.api.DataProviderBase);

/**
 * Checks provider availability. Returns true if you can use this provider.
 * @returns {boolean}
 */
fjs.api.WebWorkerDataProvider.check = function() {
   return  !!window.Worker;
};
/**
 * Sends message to synchronization module (FJSFDP)
 * @param {{action:string, data:*}} message - Message
 * @protected
 */
fjs.api.WebWorkerDataProvider.prototype.sendMessage = function(message) {
    this.worker.postMessage(message);
};