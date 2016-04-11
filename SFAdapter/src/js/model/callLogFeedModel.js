namespace('fjs.model');

fjs.model.ClientCallLogFeedModel = function(dataManager) {
    fjs.model.FeedModel.call(this, "clientcalllog", dataManager);
};
fjs.model.ClientCallLogFeedModel.extend(fjs.model.FeedModel);

fjs.model.ClientCallLogFeedModel.prototype.onEntryChange = function(event) {
    var entry = this.items[event.xpid];
    if(!entry) {
        entry = this.items[event.xpid] = new fjs.model.CallLogEntryModel(event.entry);
        this.order.push(entry);
    }
    else {
        entry.fill(event.entry);
    }
    this.prepareEntry(entry);

    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_PUSH, entry);
};
