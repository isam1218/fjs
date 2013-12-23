namespace("fjs.hud");

/**
 * @param {string} feedName
 * @param {fjs.hud.FDPDataManager} dataManager
 * @constructor
 */
fjs.hud.FeedModel = function(feedName, dataManager) {
    this.feedName = feedName;
    this.items = {};
    this.order = [];
    /**
     *
     * @type {fjs.hud.FDPDataManager}
     */
    this.fdp = dataManager;
    this.listeners = {
        "start":[]
        , "change":[]
        , "complete": []
    };
    this.init();
};

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

fjs.hud.FeedModel.prototype.onSyncStart = function(data) {
    this.fireEvent("start", data);
};

fjs.hud.FeedModel.prototype.onEntryDeletion = function(data) {
    var index = this.order.indexOf(this.items[data.xpid]);
    if(index>=0) {
        this.order.splice(index, 1);
    }
    delete this.items[data.xpid];
    this.fireEvent("delete", data);
};

fjs.hud.FeedModel.prototype.onEntryChange = function(data) {
    var entry = this.items[data.xpid];
    if(!entry) {
        entry = this.items[data.xpid] = new fjs.hud.EntryModel(data.entry);
        this.order.push(entry);
    }
    else {
        entry.fill(data.entry);
    }
    data.entry = entry;
    this.fireEvent("push", data);
};

fjs.hud.FeedModel.prototype.clearOrder = function() {
        this.order.splice(0, this.order.length);
};

fjs.hud.FeedModel.prototype.onSyncComplete = function(data) {
    this.fireEvent("complete", data);
};

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

fjs.hud.FeedModel.prototype.fireEvent = function(eventType, data) {
    var listeners = this.listeners[eventType];
    if(listeners) {
        for(var i=0; i<listeners.length; i++) {
            if(listeners[i]) {
                listeners[i](data);
            }
        }
    }
};
