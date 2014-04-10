namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.WebWorkerDataProvider = function(ticket, node, callback) {
    var context =this;
    fjs.api.DataProviderBase.call(this, ticket, node);
    this.worker = new Worker("js/lib/fdp_worker.js");
    this.worker.addEventListener("message", function(e) {
        context.fireEvent(e.data["eventType"], e.data["data"] || e.data);
    }, false);
    this.worker.addEventListener("error", function(e){
        console.error("Worker Error", e);
    });
    this.sendMessage = function(message) {
        context.worker.postMessage(message);
    };
    this.sendMessage({action:'init', data:{ticket:this.ticket, node:this.node}});

    setTimeout(function(){callback()},0);
};
fjs.api.WebWorkerDataProvider.extend(fjs.api.DataProviderBase);

/**
 * @returns {boolean}
 */
fjs.api.WebWorkerDataProvider.check = function() {
   return  !!window.Worker;
};
/**
 * @param {{action:string, data:*}} message
 */
fjs.api.WebWorkerDataProvider.prototype.sendMessage = function(message) {
    this.worker.postMessage(message);
};