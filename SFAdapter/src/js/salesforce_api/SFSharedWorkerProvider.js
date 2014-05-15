/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");
fjs.sf.SFSharedWorkerProvider = function() {
    if (!fjs.sf.SFSharedWorkerProvider.__instance) {
        var context = this;
        this.callbacks = {};
        this.worker = new SharedWorker("js/salesforce_api/sf_shared_worker.js");
        this.worker.port.addEventListener("message", function (e) {
            fjs.utils.Console.log(e);
            if (e.data["eventType"] == "ready") {
                context.sendAction({action: 'init'});
            }
            else {
                var callback = context.callbacks.get(e.id);
                callback(e.data);
                delete  context.callbacks[e.id];
            }
        }, false);

        this.worker.port.addEventListener("error", function (e) {
            fjs.utils.Console.error("Worker Error", e);
        });
        this.worker.port.start();
        this.worker.port.postMessage("ping'");

        this.sendAction = function(message) {
            if(message) {
                var id = fjs.utils.GUID.create();
                context.callbacks[id] = message.callback;
                message.id = id;
                message.callback = null;
            }
            context.worker.port.postMessage(message);
        };

        fjs.sf.SFSharedWorkerProvider.__instance = this;
    }
    return fjs.sf.SFSharedWorkerProvider.__instance;
};

/**
 * @returns {boolean}
*/
fjs.sf.SFSharedWorkerProvider.check = function() {
    return  !!self.SharedWorker;
};
