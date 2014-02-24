namespace("fjs.api");
/**
 * @param {string} ticket
 * @param {string} node
 * @param {*} config
 * @constructor
 * @implements fjs.api.IDataProvider
 */
fjs.api.ClientDataProviderBase = function(ticket, node, config) {
    this.ticket = ticket;
    this.node = node;
    this.config = config;
    this.listeners = {};
};

/**
 * @returns {boolean}
 */
fjs.api.ClientDataProviderBase.check = function() {
    return false;
};


/**
 * @param {string} eventType
 * @param {Function} listener
 */
fjs.api.ClientDataProviderBase.prototype.addListener = function(eventType, listener) {
    if(!this.listeners[eventType]) {
        this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
};

/**
 * @param {string} eventType
 * @param {Function} listener
 */
fjs.api.ClientDataProviderBase.prototype.removeListener = function(eventType, listener) {
    if(this.listeners[eventType]) {
        var index = this.listeners[eventType].indexOf(listener);
        if(index>=0) {
            this.listeners[eventType].splice(index, 1);
        }
    }
};

/**
 * @param {string} eventType
 * @param {*} data
 * @protected
 */
fjs.api.ClientDataProviderBase.prototype.fireEvent = function(eventType, data) {
    if(this.listeners[eventType]) {
        for(var i=0; i<this.listeners[eventType].length; i++) {
            this.listeners[eventType][i](data);
        }
    }
};
/**
 * @param {{action:string, data:*}} message
 * @protected
 */
fjs.api.ClientDataProviderBase.prototype.sendMessage = function(message) {

};
/**
 * @param {string} feedName
 */
fjs.api.ClientDataProviderBase.prototype.addSyncForFeed = function(feedName) {
    this.sendMessage({action:"registerSync", data:{feedName:feedName}});
};

/**
 * @param {string} feedName
 */
fjs.api.ClientDataProviderBase.prototype.removeSyncForFeed = function(feedName) {
    this.sendMessage({action:"unregisterSync", data:{feedName:feedName}});
};

fjs.api.ClientDataProviderBase.prototype.logout = function() {
    this.sendMessage({action:'logout', data:null});
};

fjs.api.ClientDataProviderBase.prototype.sendAction = function(feedName, actionName, data) {
    this.sendMessage({action:'fdp_action', data:{'actionName':actionName, 'params':data}});
};


namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.ClientDataProviderBase
 */
fjs.api.SimpleClientDataProvider = function(ticket, node, callback) {
    var context = this;
    fjs.api.ClientDataProviderBase.call(this, ticket, node);
    var SYNCHRONIZATION_URL = "js/lib/fjs.fdp.debug.js";
    var script = document.createElement('script');
    /**
     * @type {fjs.fdp.DataManager}
     */
    this.dataManager = null;

    this.onSync = function(data) {
        context.fireEvent("sync", data);
    };
    this.authHandler = {
        requestAuth: function() {
            context.fireEvent("requestAuth", null);
        }
        , setNode: function(node) {
            context.fireEvent("setNode", {"node":node});
        }
    };

    script.onload = function() {
        context.dataManager = new fjs.fdp.DataManager(context.ticket, context.node, window, context.authHandler, function(){});
        callback();
    };
    document.head.appendChild(script);
    script.src = SYNCHRONIZATION_URL;
};
fjs.api.SimpleClientDataProvider.extend(fjs.api.ClientDataProviderBase);

/**
 * @returns {boolean}
 */
fjs.api.SimpleClientDataProvider.check = function() {
    return true;
};

/**
 * @param {{action:string, data:*}} message
 */
fjs.api.SimpleClientDataProvider.prototype.sendMessage = function(message) {
    switch (message.action) {
        case "registerSync":
            this.dataManager.addListener(message.data.feedName, this.onSync);
            break;
        case "unregisterSync":
            this.dataManager.removeListener(message.data.feedName, this.onSync);
            break;
        case "logout":
            this.dataManager.logout();
            break;
        case "fdp_action":
            this.dataManager.sendAction(message.data.feedName, message.data.actionName, message.data.params);
            break;
    }
};

namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.ClientDataProviderBase
 */
fjs.api.WebWorkerDataProvider = function(ticket, node, callback) {
    var context =this;
    fjs.api.ClientDataProviderBase.call(this, ticket, node);
    this.worker = new Worker("js/lib/fdp_worker.js");
    this.worker.addEventListener("message", function(e) {
        context.fireEvent(e.data["action"], e.data["data"]);
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
fjs.api.WebWorkerDataProvider.extend(fjs.api.ClientDataProviderBase);

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
};namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.ClientDataProviderBase
 */
fjs.api.SharedWorkerDataProvider = function(ticket, node, callback) {
    var context =this;
    fjs.api.ClientDataProviderBase.call(this, ticket, node);
    this.worker = new SharedWorker("js/lib/fdp_shared_worker.js");
    this.worker.port.addEventListener("message", function(e) {
        if(e.data["action"]=="ready") {
            context.sendMessage({action:'init', data:{ticket:context.ticket, node:context.node}});
            callback();
        }
        context.fireEvent(e.data["action"], e.data["data"]);
    }, false);
    this.worker.port.addEventListener("error", function(e){
        console.error("Worker Error", e);
    });
    this.worker.port.start();
    this.sendMessage = function(message) {
        this.worker.port.postMessage(message);
    };
};
fjs.api.SharedWorkerDataProvider.extend(fjs.api.ClientDataProviderBase);

/**
 * @returns {boolean}
 */
fjs.api.SharedWorkerDataProvider.check = function() {
    return  !!window.SharedWorker;
};
namespace("fjs.api");

fjs.api.FDPProviderFactory = function() {
    /**
     * register of providers
     * @enum {Function}
     * @private
     */
    this._providers = {
        'sharedWorker': fjs.api.SharedWorkerDataProvider
        , 'webWorker': fjs.api.WebWorkerDataProvider
        , 'simple': fjs.api.SimpleClientDataProvider
    }
};
/**
 * @param ticket
 * @param node
 * @param callback
 * @returns {fjs.api.ClientDataProviderBase|undefined}
 */
fjs.api.FDPProviderFactory.prototype.getProvider = function(ticket, node, callback) {
    for(var i=0; i<fjs.fdp.CONFIG.providers.length; i++) {
        var provider = this._providers[fjs.fdp.CONFIG.providers[i]];
        if(provider.check()) {
            return new provider(ticket, node, callback);
        }
    }
};