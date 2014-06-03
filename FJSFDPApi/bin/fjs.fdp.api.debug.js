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

        this.lastValues = {};

        this.lastMasterValue = null;

        this.hasChange = false;

        this.cookiesSynchronizationRuned = false;

        /**
         * runs master iteration
         * @private
         */
        this._runMaster = function() {
            context._masterIteration();
        };

        this.db = null;

        /**
         * @private
         */
        this._masterIteration = function() {
            if(fjs.utils.Browser.isIE11()) {
                fjs.utils.Cookies.set(context.TABS_SYNCRONIZE_KEY, context.tabId+"|"+Date.now());
            }
            else {
                localStorage.setItem(context.TABS_SYNCRONIZE_KEY, context.tabId+"|"+Date.now());
            }
            if(!context.isMaster) {
                context.fireEvent('master_changed', (context.isMaster = true));
            }
            clearTimeout(context.timeoutId);
            context.timeoutId = setTimeout(context._masterIteration, context.MASTER_ACTIVITY_TIMEOUT);
        };

        this.onStorage = function(e) {
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
        };

        if(fjs.utils.Browser.isIE11()) {
            setInterval(function(){
                var syncVal = fjs.utils.Cookies.get(context.TABS_SYNCRONIZE_KEY);
                if(syncVal && syncVal!=context.lastMasterValue) {
                    context.onStorage({key: context.TABS_SYNCRONIZE_KEY, newValue: syncVal});
                    context.lastMasterValue = syncVal;
                }
            }, 0);
        }
        else {
            self.addEventListener('storage', context.onStorage, false);
        }

        if(this._checkMaster()){
            this._runMaster();
        }
        else {
            this.timeoutId = setTimeout(this._runMaster, this.CHANGE_TAB_TIMEOUT);
        }
    };
    fjs.api.TabsSynchronizer.extend(fjs.EventsSource);

    fjs.api.TabsSynchronizer.prototype._checkMaster = function() {
        var lsvals;
        if(fjs.utils.Browser.isIE11()) {
            lsvals = fjs.utils.Cookies.get(this.TABS_SYNCRONIZE_KEY);
        }
        else {
            lsvals = localStorage.getItem(this.TABS_SYNCRONIZE_KEY);
        }
        return !lsvals || (Date.now() - parseInt(lsvals.split("|")[1]))>this.CHANGE_TAB_TIMEOUT;
    };

    fjs.api.TabsSynchronizer.prototype.addEventListener = function(eventType, handler) {
        var context = this;
        if(fjs.utils.Browser.isIE11() && eventType!='master_changed') {
            if(!this.lastValues[eventType])
                this.lastValues[eventType] = [];
            if(!this.cookiesSynchronizationRuned) {
                this.db = new fjs.db.DBFactory().getDB();
                setInterval(function(){
                    for(var key in context.lastValues) {
                        var _lastValues = context.lastValues[key];
                        if(context.db.state == 1) {
                            (function(_lastValues) {
                                context.db.selectByIndex('tabsync', {eventType: key}, function (item) {
                                }, function (items){
                                    if(items) {
                                        items.sort(function(a,b){
                                            if(a.order>b.order) return 1;
                                            else if(a.order<b.order) return -1;
                                            return 0;
                                        });
                                        for (var i = 0; i < items.length; i++) {
                                            var item = items[i], tkey = item.key;
                                            var keyarr = tkey.split('|');
                                            if (_lastValues.indexOf(tkey) < 0 && keyarr[1] != context.tabId) {
                                                console.log("read", tkey);
                                                context.fireEvent(item.eventType, {key: item.eventType, newValue: item.val});
                                                _lastValues.push(tkey);
                                                (function (key) {
                                                    setTimeout(function () {
                                                        var index = _lastValues.indexOf(key);
                                                        if (index >= 0) {
                                                            _lastValues.splice(index, 1);
                                                        }
                                                    }, 10000);
                                                })(tkey);
                                            }
                                        }
                                    }
                                });
                            })(_lastValues);
                        }
                    }
                },1000);
            }
        }
        this.superClass.addEventListener.call(this, eventType, handler);
    };

    fjs.api.TabsSynchronizer.prototype.removeEventListener = function(eventType, handler) {
        if(fjs.utils.Browser.isIE11()) {
            var index = this.lastValues[eventType].indexOf(handler);
            if(index>-1) {
                this.lastValues[eventType].splice(index, 1);
            }
            if(this.lastValues[eventType].length = 0) {
                delete this.lastValues[eventType];
            }
        }
        this.superClass.removeEventListener.call(this, eventType, handler);
    };

    fjs.api.TabsSynchronizer.prototype.generateDataKey = function(eventType) {
        var inc = new fjs.utils.Increment();
        return eventType + "|" + this.tabId + "|" + inc.get("tabsyncKeys");
    };

    fjs.api.TabsSynchronizer.prototype.setSyncValue = function(key, value) {
        //console.log('syncData', fjs.utils.JSON.parse(value), value);
        if(this.db && this.db.state == 1) {
            var genKey = this.generateDataKey(key), context = this;
            var inc = new fjs.utils.Increment();
            (function(genKey){
                console.log("write", genKey);
                context.db.insertOne("tabsync", {key:genKey, eventType:key, val:value, order:Date.now()+""+inc.get('tabsSync')}, function(){
                    setTimeout(function(){
                        context.db.deleteByKey("tabsync", genKey);
                    },5000);
                });
            })(genKey);
        }
    };
})();