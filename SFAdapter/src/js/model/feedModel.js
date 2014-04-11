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
    this.order = [];
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
fjs.model.FeedModel.EVENT_TYPE_CHANGE= "change";
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
                if(fjs.model.FeedModel.EVENT_TYPE_CHANGE == change.type) {
                    context.onEntryChange(change);
                }
                else if(fjs.model.FeedModel.EVENT_TYPE_DELETE == change.type) {
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

fjs.model.FeedModel.prototype.onEntryDeletion = function(event) {
    var item = this.items[event.xpid];
    var index = this.order.indexOf(item);
    if(index>-1){
        this.order.splice(index, 1);
    }
    delete this.items[event.xpid];
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_DELETE, event);
};

fjs.model.FeedModel.prototype.onEntryChange = function(event) {
    var entry = this.items[event.xpid];
    if(!entry) {
        entry = this.items[event.xpid] = new fjs.model.EntryModel(event.entry);
        this.order.push(entry);
    }
    else {
        entry.fill(event.entry);
    }
    this.prepareEntry(entry);

    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_PUSH, entry);
};

fjs.model.FeedModel.prototype.onSyncComplete = function(data) {
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_COMPLETE, data);
};

fjs.model.FeedModel.prototype.addEventListener = function(eventType, callback) {
    fjs.EventsSource.prototype.addEventListener.call(this, eventType, callback);
    if(eventType==fjs.model.FeedModel.EVENT_TYPE_PUSH) {
       for(var i in this.items) {
           if(this.items.hasOwnProperty(i))
                callback({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:i, entry:this.items[i]});
       }
    }
};
