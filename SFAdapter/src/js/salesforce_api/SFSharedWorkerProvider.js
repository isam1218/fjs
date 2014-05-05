/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");
fjs.sf.SFSharedWorkerProvider = function() {
    var context =this;
    this.worker = new SharedWorker("sf_shared_worker.js");
    this.worker.port.addEventListener("message", function(e) {
        if(e.data["eventType"]=="ready") {
            context.sendMessage({action:'init'});
        }
        context.fireEvent(e.data["eventType"], e.data);
        // get id from message, get listener, call callback
    }, false);

    this.worker.port.addEventListener("error", function(e){
        console.error("Worker Error", e);
    });

    this.worker.port.start();

    this.sendMessage = function(message) {
        // put, add id to message
        this.worker.port.postMessage(message);
    };
};

/**
 * @returns {boolean}
*/
fjs.sf.SFSharedWorkerProvider.check = function() {
    return  !!self.SharedWorker;
};
