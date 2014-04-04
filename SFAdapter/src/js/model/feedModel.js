namespace("fjs.model");

fjs.model.FeedModel = function(feedName) {
    this.feedName = feedName;
    this.items = {};
    this.fdp = new fjs.fdp.SyncManager();
    this.listeners = {
        "start":[]
        , "push":[]
        , "delete":[]
        , "complete": []
    };
};

fjs.model.FeedModel.EVENT_TYPE_START = "start";
fjs.model.FeedModel.EVENT_TYPE_PUSH = "push";
fjs.model.FeedModel.EVENT_TYPE_DELETE = "delete";
fjs.model.FeedModel.EVENT_TYPE_COMPLETE = "complete";

fjs.model.FeedModel.prototype.prepareEntry = function(data) {
    data.entry.xpid = data.xpid;
};

fjs.model.FeedModel.prototype.getEntryByXpid = function(xpid) {
    return this.items[xpid];
};

fjs.model.FeedModel.prototype.init = function() {
    var context = this;
    this.fdp.addListener(this.feedName, function(data){
        switch (data.eventType) {
            case fjs.model.FeedModel.EVENT_TYPE_START:
                context.onSyncStart(data);
                break;
            case fjs.model.FeedModel.EVENT_TYPE_PUSH:
                context.onEntryChange(data);
                break;
            case fjs.model.FeedModel.EVENT_TYPE_DELETE:
                context.onEntryDeletion(data);
                break;
            case fjs.model.FeedModel.EVENT_TYPE_COMPLETE:
                context.onSyncComplete(data);
                break;
        }
    });
};

fjs.model.FeedModel.prototype.onSyncStart = function(data) {
    if(data.syncType == "F") {
        this.items = {};
    }
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_START, data);
};

fjs.model.FeedModel.prototype.onEntryDeletion = function(data) {
    delete this.items[data.xpid];
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_DELETE, data);
};

fjs.model.FeedModel.prototype.onEntryChange = function(data) {
    this.prepareEntry(data);
    this.items[data.xpid] = data.entry;
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_PUSH, data);
};

fjs.model.FeedModel.prototype.onSyncComplete = function(data) {
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_COMPLETE, data);
};

fjs.model.FeedModel.prototype.addListener = function(eventType, callback) {
    this.listeners[eventType].push(callback);
    if(eventType==fjs.model.FeedModel.EVENT_TYPE_PUSH) {
       for(var i in this.items) {
           callback({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:i, entry:this.items[i]});
       }
    }
};

fjs.model.FeedModel.prototype.removeListener = function(eventType, callback) {
    var i =this.listeners[eventType].indexOf(callback);
    if(i>-1) {
        this.listeners[eventType].splice(i, 1);
    }
};

fjs.model.FeedModel.prototype.fireEvent = function(eventType, data) {
    var listeners = this.listeners[eventType];
    for(var i=0; i<listeners.length; i++) {
        listeners[i](data);
    }
};
