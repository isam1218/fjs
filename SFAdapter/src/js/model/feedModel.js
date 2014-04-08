namespace("fjs.model");
/**
 * @param feedName
 * @param dataManager
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.model.FeedModel = function(feedName, dataManager) {
    fjs.EventsSource.call(this);
    this.feedName = feedName;
    this.items = {};
    this.dataManager = dataManager;
    this.listeners = {
        "start":[]
        , "push":[]
        , "delete":[]
        , "complete": []
    };
    this.init();
};

fjs.model.FeedModel.extend(fjs.EventsSource);

fjs.model.FeedModel.EVENT_TYPE_START = "start";
fjs.model.FeedModel.EVENT_TYPE_PUSH = "push";
fjs.model.FeedModel.EVENT_TYPE_DELETE = "delete";
fjs.model.FeedModel.EVENT_TYPE_COMPLETE = "complete";

fjs.model.FeedModel.prototype.getEntryByXpid = function(xpid) {
    return this.items[xpid];
};

fjs.model.FeedModel.prototype.init = function() {
    var context = this;
    this.dataManager.addEventListener(this.feedName, function(data){
        context.onSyncStart();
        for(var key in data.changes) {
            if(data.changes.hasOwnProperty(key)) {
                var change = data.changes[key];
                if('change' == change.type) {
                    context.onEntryChange(change.entry);
                }
                else if('delete' == change.type) {
                    context.onEntryDeletion(change);
                }
                else {
                    console.error("Unknown change type:", change.type);
                }
            }
        }
        context.onSyncComplete();
    });
};

fjs.model.FeedModel.prototype.prepareEntry = function(data) {
};

fjs.model.FeedModel.prototype.onSyncStart = function(data) {
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

fjs.model.FeedModel.prototype.addEventListener = function(eventType, callback) {
    this.superClass.addEventListener.call(this, eventType, callback);
    if(eventType==fjs.model.FeedModel.EVENT_TYPE_PUSH) {
       for(var i in this.items) {
           if(this.items.hasOwnProperty(i))
                callback({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:i, entry:this.items[i]});
       }
    }
};
