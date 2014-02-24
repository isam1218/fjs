namespace("fjs.hud");

/**
 * @param {string} feedName
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 */
fjs.hud.FeedModel = function(feedName, dataManager) {
    this.feedName = feedName;

    /**
     * @type {Object}
     */
    this.items = {};
    this.order = [];
    /**
     *
     * @type {fjs.hud.DataManager}
     */
    this.fdp = dataManager;
    this.listeners = {
        "start":[]
        , "change":[]
        , "complete": []
        , "push": []
        , "delete": []
    };
    this.xpidListeners = {};
    this.init();
};
/**
 * Initializes model
 * @protected
 */
fjs.hud.FeedModel.prototype.init = function() {
    var context = this;
    this.fdp.addListener(this.feedName, function(data){
        context.onSyncStart({feed:data["feed"], eventType:"start"});
        var changes = data["changes"];
        for(var key in changes) {
            if(changes[key].type=="change") {
                context.onEntryChange(changes[key]);
            }
            else if(changes[key].type=="delete") {
                context.onEntryDeletion(changes[key]);
            }
        }
        context.onSyncComplete({feed:data["feed"], eventType:"complete"});
    });

};

/**
 * Sync start event handler
 * @param data
 * @protected
 */
fjs.hud.FeedModel.prototype.onSyncStart = function(data) {
    this.fireEvent("start", data);
};

/**
 * Entry deletion event handler
 * @param data
 * @protected
 */
fjs.hud.FeedModel.prototype.onEntryDeletion = function(data) {
    var index = this.order.indexOf(this.items[data.xpid]);
    if(index>=0) {
        this.order.splice(index, 1);
    }
    delete this.items[data.xpid];
    this.fireEvent("delete", data);
};

/**
 * Entry change event handler
 * @param data
 * @protected
 */
fjs.hud.FeedModel.prototype.onEntryChange = function(data) {
    var entry = this.items[data.xpid];
    if(!entry) {
        entry = this.items[data.xpid] = this.createEntry(data.entry);
        this.order.push(entry);
    }
    else {
        entry.fill(data.entry);
    }
    data.entry = entry;
    this.fireEvent("push", data);
};

/**
 * @protected
 */
fjs.hud.FeedModel.prototype.clearOrder = function() {
        this.order.splice(0, this.order.length);
};

/**
 * Entry sync complete handler
 * @param data
 * @protected
 */
fjs.hud.FeedModel.prototype.onSyncComplete = function(data) {
    this.fireEvent("complete", data);
};

/**
 *
 * @param eventType
 * @param callback
 */
fjs.hud.FeedModel.prototype.addListener = function(eventType, callback) {
    this.listeners[eventType].push(callback);
    if(eventType=="change") {
        for(var key in this.items) {
            callback({eventType:"change", xpid:key, entry:this.items[key]});
        }
    }
};

fjs.hud.FeedModel.prototype.removeListener = function(eventType, callback) {
    var i =this.listeners[eventType].indexOf(callback);
    if(i>-1) {
        this.listeners[eventType].splice(i, 1);
    }
};
fjs.hud.FeedModel.prototype.addXpidListener = function(xpid, callback) {
    var _listeners = this.xpidListeners[xpid];
    if(!_listeners){
        this.xpidListeners[xpid] = _listeners = [];
    }
    var index = _listeners.indexOf(callback);
    if(index<0) {
        _listeners.push(callback);
    }
    if(this.items[xpid]) {
        callback({eventType:"change", xpid:xpid, entry:this.items[xpid]});
    }
};

fjs.hud.FeedModel.prototype.removeXpidListener = function(xpid, listener) {
    var _listeners = this.xpidListeners[xpid];
    if(_listeners){
        var index = _listeners.indexOf(listener);
        if(index>-1) {
            _listeners.splice(index, 1);
        }
        if(_listeners.length == 0){
            delete this.xpidListeners[xpid];
        }
    }
};
fjs.hud.FeedModel.prototype.fireEvent = function(eventType, data) {
    /**
     * @type {Array}
     */
    var listeners = this.listeners[eventType];
    if(listeners) {
        for(var i=0; i<listeners.length; i++) {
                listeners[i](data);
        }
    }
    if(data.xpid){
        var _listeners = this.xpidListeners[data.xpid];
        if(_listeners) {
            for(var i=0; i<_listeners.length; i++) {
                _listeners[i](data);
            }
        }
    }
};

fjs.hud.FeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.EntryModel(obj);
};
/**
 *
 * @param xpid
 * @returns {*}
 */
fjs.hud.FeedModel.prototype.getEntry = function(xpid) {
    return this.items[xpid];
};
