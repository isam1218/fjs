namespace("fjs.fdp.model");
/**
 * Proxy model for client feeds
 * @param {Array.<string>} feeds List of joined feeds
 * @param {fjs.fdp.SyncManager} syncManager SynchronizationManager
 * @constructor
 * @extends fjs.fdp.model.ClientFeedProxyModel
 */
fjs.fdp.model.MyCallsClientProxyModel = function(feeds, syncManager) {
    fjs.fdp.model.ClientFeedProxyModel.call(this, feeds, syncManager);
    this.callLogByHTCallId = {};
};
fjs.fdp.model.MyCallsClientProxyModel.extend(fjs.fdp.model.ClientFeedProxyModel);


/**
 * Handler of that entry has changed
 * @param {Object} event - Event object
 * @protected
 */
fjs.fdp.model.MyCallsClientProxyModel.prototype.onEntryChange = function(event) {
    /**
     * @type {fjs.fdp.model.EntryModel}
     */
    var item = this.items[event.xpid];
    var _entry = this.prepareEntry(event.entry, event.feed, event.xpid);
    if(!item) {
        if(event.feed==this.clientFeedName && this.clientFeedName!=this.feedName) {
            return;
        }
        var _change = this.fillChange(event.xpid, _entry, event.feed);
        if(_change.type != 'delete') {
            this.items[event.xpid] = new fjs.fdp.model.EntryModel(_entry);
        }
    }
    else {
        var changes = item.fill(_entry);
        if(changes)
            this.fillChange(event.xpid, changes, event.feed);
    }
    this.keepEntries[event.xpid] = event;
};

/**
 * Handler of that entry has deleted
 * @param {Object} event Event object
 */
fjs.fdp.model.MyCallsClientProxyModel.prototype.onEntryDeletion = function(event) {
    if(event.feed == this.feedName) {
        var delItem = this.items[event.xpid];
        this.sendAction(this.clientFeedName, 'delete', {xpid:event.xpid}, true);
        this.callLogByHTCallId[delItem.htCallId] = delItem['mycallsclient_callLog'];
        delete this.items[event.xpid];
    }
    this.fillDeletion(event.xpid, event.feed);
};

/**
 * Sync iteration ends.
 * @private
 */
fjs.fdp.model.MyCallsClientProxyModel.prototype.onSyncComplete = function() {
    var itemsKeys = Object.keys(this.items);
    for(var i=0; i<itemsKeys.length; i++) {
        var key = itemsKeys[i], _htCallId = this.items[key].htCallId, callLog = this.callLogByHTCallId[_htCallId];
        if(callLog) {
            this.sendAction(this.clientFeedName, 'push', {callLog:callLog, xpid:key});
        }
    }
    if(this.changes) {
        this.fireEvent({feed:this.clientFeedName, changes:this.changes});
    }
    this.changes= null;
    this.callLogByHTCallId = {};
};