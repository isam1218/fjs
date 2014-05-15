namespace("fjs.api");
/**
 * @param {string} ticket
 * @param {string} node
 * @param {*} config
 * @constructor
 * @implements fjs.api.IDataProvider
 * @extends fjs.EventsSource
 */
fjs.api.DataProviderBase = function(ticket, node, config) {
    fjs.EventsSource.call(this);
    this.ticket = ticket;
    this.node = node;
    this.config = config;
    this.listeners = {};
};
fjs.api.DataProviderBase.extend(fjs.EventsSource);


/**
 * @returns {boolean}
 */
fjs.api.DataProviderBase.check = function() {
    return false;
};


/**
 * @param {{action:string, data:*}} message
 * @protected
 */
fjs.api.DataProviderBase.prototype.sendMessage = function(message) {

};
/**
 * @param {string} feedName
 */
fjs.api.DataProviderBase.prototype.addSyncForFeed = function(feedName) {
    this.sendMessage({action:"registerSync", data:{feedName:feedName}});
};

/**
 * @param {string} feedName
 */
fjs.api.DataProviderBase.prototype.removeSyncForFeed = function(feedName) {
    this.sendMessage({action:"unregisterSync", data:{feedName:feedName}});
};

fjs.api.DataProviderBase.prototype.logout = function() {
    this.sendMessage({action:'logout', data:null});
};

fjs.api.DataProviderBase.prototype.sendAction = function(feedName, actionName, data) {
    this.sendMessage({action:'fdp_action', data:{'actionName':actionName, 'params':data}});
};





namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.SimpleClientDataProvider = function(ticket, node, callback) {
    var context = this;
    fjs.api.DataProviderBase.call(this, ticket, node);
    var SYNCHRONIZATION_URL = "js/lib/fjs.fdp.debug.js";
    var script = document.createElement('script');
    /**
     * @type {fjs.fdp.DataManager}
     */
    this.dataManager = null;

    this.onSync = function(data) {
        context.fireEvent("sync", data);
    };


    script.onload = function() {
        context.dataManager = new fjs.fdp.DataManager(context.ticket, context.node, fjs.fdp.CONFIG, function(){});
        context.dataManager.addEventListener("", function(e) {
            context.fireEvent(e.eventType, e);
        });
        callback();
    };
    document.head.appendChild(script);
    script.src = SYNCHRONIZATION_URL;
};
fjs.api.SimpleClientDataProvider.extend(fjs.api.DataProviderBase);

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
            this.dataManager.addFeedListener(message.data.feedName, this.onSync);
            break;
        case "unregisterSync":
            this.dataManager.removeFeedListener(message.data.feedName, this.onSync);
            break;
        case "logout":
            this.dataManager.logout();
            break;
        case "fdp_action":
            this.dataManager.sendAction(message.data.feedName, message.data.actionName, message.data.params);
            break;
        case "SFLogin":
            this.dataManager.SFLogin(message.data);
            break;
        default:
            fjs.utils.Console.error("Unknown action: " + message.action);
    }
};

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
 * @returns {boolean}
 */
fjs.api.SharedWorkerDataProvider.check = function() {
    return  !!self.SharedWorker;
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
 * @returns {fjs.api.DataProviderBase|undefined}
 */
fjs.api.FDPProviderFactory.prototype.getProvider = function(ticket, node, callback) {
    for(var i=0; i<fjs.fdp.CONFIG.providers.length; i++) {
        var provider = this._providers[fjs.fdp.CONFIG.providers[i]];
        if(provider.check()) {
            return new provider(ticket, node, callback);
        }
    }
};(function(){

    namespace('fjs.api');
    /**
     * Manager is responsible for assign general tab (Synchronization tab)
     * <br>
     * <b>Singleton</b>
     * @constructor
     * @extends fjs.EventsSource
     */
    fjs.api.TabsSynchronizer = function() {
       if (!this.constructor.__instance)
           this.constructor.__instance = this;
       else return this.constructor.__instance;

       var context = this;

       fjs.EventsSource.call(this);

        /**
        * Time after which main tab may be change if previous tab silent or die
        * @type {number}
        * @private
        */
       this.CHANGE_TAB_TIMEOUT = 2000;
        /**
         * Interval that which the main tab says that he is alive
         * @type {number}
         * @private
         */
       this.MASTER_ACTIVITY_TIMEOUT = 500;
        /**
         * LocalStorage key for main tab id
         * @type {string}
         * @private
         */
       this.TABS_SYNCRONIZE_KEY = 'tabs_sync_maintab';
        /**
         * Tab ID
         * @type {string}
         */
       this.tabId = Date.now()+'_'+fjs.utils.GUID.create();
        /**
         * Timeout Id
         * @type {null}
         * @private
         */
       this.timeoutId  = null;
        /**
         * Is main tab flag
         * @type {boolean}
         */
       this.isMaster = this._checkMaster();

        /**
         * runs master iteration
         * @private
         */
        this._runMaster = function() {
            context._masterIteration();
        };

        /**
         * @private
         */
        this._masterIteration = function() {
            localStorage[context.TABS_SYNCRONIZE_KEY] = context.tabId+"|"+Date.now();
            if(!context.isMaster) {
                context.fireEvent('master_changed', (context.isMaster = true));
            }
            clearTimeout(context.timeoutId);
            context.timeoutId = setTimeout(context._masterIteration, context.MASTER_ACTIVITY_TIMEOUT);
        };

        self.addEventListener('storage', function(e) {
            if(e.key == context.TABS_SYNCRONIZE_KEY) {
                var lsvals = e.newValue.split("|");
                if(lsvals[0]!=context.tabId) {
                    if(context.tabId > lsvals[0]) {
                        if (context.isMaster) {
                            context.fireEvent('master_changed', (context.isMaster = false));
                        }
                        clearTimeout(context.timeoutId);
                        context.timeoutId = setTimeout(context._runMaster, context.CHANGE_TAB_TIMEOUT);
                    }
                }
            }
        }, false);

        if(this._checkMaster()){
            this._runMaster();
        }
        else {
            this.timeoutId = setTimeout(this._runMaster, this.CHANGE_TAB_TIMEOUT);
        }
   };
   fjs.api.TabsSynchronizer.extend(fjs.EventsSource);

   fjs.api.TabsSynchronizer.prototype._checkMaster = function() {
        var lsvals = localStorage[this.TABS_SYNCRONIZE_KEY];
        return !lsvals || (Date.now() - parseInt(lsvals.split("|")[1]))>this.CHANGE_TAB_TIMEOUT;
   };
})();