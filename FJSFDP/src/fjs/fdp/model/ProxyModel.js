(function() {
var _ProxyModel =
 /**
 * Base proxy model. <br/>
 * It combines joined feeds, monitors and collect changes and sends changed fields only.
 * @param {Array.<string>} feeds - List of joined feeds (parent feed first)
 * @param {fjs.fdp.SyncManager} syncManager - Synchronization manager
 * @constructor
 * @extends fjs.model.EventsSource
 */
fjs.fdp.model.ProxyModel = function(feeds, syncManager) {
    var context = this;
    fjs.model.EventsSource.call(this);
    /**
     * @type {Object}
     */
    this.items ={};

    this.keepEntries={};

    this.changes={};

    this.feeds = feeds;

    this.feedName = feeds[0];

    this.feedFields = {};

    this.sm = syncManager;

    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    };

    /**
     * Adds listeners to sync manager. <br>
     * That action initiates synchronization for this feeds
     * @private
     */
    this.attach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.addFeedListener(this.feeds[i], onSyncEvent);
        }
    };

    /**
     * Removes listeners from sync manager <br>
     * That action ends syncronization for this feeds
     * @private
     */
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.removeFeedListener(this.feeds[i], onSyncEvent);
        }
    };
};
fjs.core.inherits(_ProxyModel, fjs.model.EventsSource);

  _ProxyModel.EVENT_TYPE_FEED_CHANGE = "feed_change";

/**
 * Adds event handler function to feed changes
 * @param {string} eventType - Type of event
 * @param {Function} listener - Event handler, method to execute when fdp data changed.
 */
_ProxyModel.prototype.addEventListener = function(eventType, listener) {
    switch(eventType) {
        case _ProxyModel.EVENT_TYPE_FEED_CHANGE:
            var changes = this.createFullChange();
            if(changes) {
                listener({feed: this.feedName, changes:changes});
            }
            if(!this.listeners[eventType] || this.listeners[eventType].length == 0) {
                this.attach();
            }
            break;
    }
    _ProxyModel.super_.prototype.addEventListener.call(this, eventType, listener);
};

/**
 * Removes listener function from feed
 * @param {string} eventType - Event type
 * @param {Function} listener - Event handler, method to execute when fdp data changed.
 */
_ProxyModel.prototype.removeEventListener = function(eventType, listener) {
    _ProxyModel.super_.prototype.removeEventListener.call(this, eventType, listener);
    switch(eventType) {
        case _ProxyModel.EVENT_TYPE_FEED_CHANGE:
            if(!this.listeners[eventType] || this.listeners[eventType].length == 0) {
                this.detach();
            }
        break;
    }
};

/**
 * Creates changes object with all existed items.
 * @returns {Object | null}
 * @protected
 */
_ProxyModel.prototype.createFullChange = function() {
    var keys = Object.keys(this.items);
    if(keys.length>0) {
        var _changes = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            _changes[key] = new fjs.fdp.model.EntryChange(this.feedName, key, this.items[key], fjs.fdp.model.EntryChange.CHANGE_TYPE_CHANGE).getJSON();
        }
        return _changes;
    }
    else return null;
};

/**
 * Handler of that entry has changed
 * @param {Object} event - Event object
 * @protected
 */
_ProxyModel.prototype.onEntryChange = function(event) {
    /**
     * @type {fjs.fdp.model.EntryModel}
     */
    var item = this.items[event.xpid], change=this.changes[event.xpid];
    if(!change) {
        change = this.changes[event.xpid] = new fjs.fdp.model.EntryChange(this.feedName, event.xpid);
    }

    if(!item) {
        if(change.type != 'delete') {
            item = this.items[event.xpid] = new fjs.fdp.model.EntryModel(change.entry, event.xpid);
            change.fillChange(item, event.entry, event.feed);
        }
    }
    else {
        change.fillChange(item, event.entry, event.feed);
    }
    this.keepEntries[event.xpid] = event;
};
/**
 * Handler of that entry has deleted
 * @param {Object} event - event object
 */
_ProxyModel.prototype.onEntryDeletion = function(event) {
    var change=this.changes[event.xpid];
    if(!change) {
        change = this.changes[event.xpid] = new fjs.fdp.model.EntryChange(this.feedName, event.xpid);
    }
    change.fillDeletion(this.items[event.xpid], event.feed);
    if(event.feed == this.feedName) {
        delete this.items[event.xpid];
    }
};
/**
 * Keep entry event.
 * @param {Object} event - keep entry event object
 */
_ProxyModel.prototype.onEntryKeep = function(event) {
    this.keepEntries[event.xpid] = event;
};


/**
 * Source complete event.
 * @param {Object} event - source complete event object
 * @protected
 */
_ProxyModel.prototype.onSourceComplete = function(event) {
    if(event.syncType==fjs.fdp.SyncManager.syncTypes.FULL || event.syncType==fjs.fdp.SyncManager.syncTypes.KEEP) {
        var keys = Object.keys(this.items);
        for(var i=0; i<keys.length; i++) {
            var key = keys[i];
            if(event.sourceId == this.items[key].source && !this.keepEntries[key]) {
                var _event = {eventType: fjs.fdp.SyncManager.eventTypes.ENTRY_DELETION, feed:event.feed, xpid: key, entry: null};
                this.onEntryDeletion(_event);
            }
        }
    }
    this.keepEntries = {};
};

/**
 * Clears all data for feed
 */
_ProxyModel.prototype.clear = function() {
    this.changes = {};
    var keys = Object.keys(this.items);
    for(var i = 0; i<keys.length; i++)  {
        var xpid = keys[i];
        this.changes[xpid] = new fjs.fdp.model.EntryChange(this.feedName, xpid, null, 'delete');
        delete this.items[xpid];
    }
    this.onSyncComplete();
};

/**
 * Handler of SyncManager events
 * @param {Object} event - event object
 * @protected
 */
_ProxyModel.prototype.onSyncEvent = function(event) {
    var eventTypes = fjs.fdp.SyncManager.eventTypes;
    switch(event.eventType) {
        case eventTypes.CLEAR:
            this.clear();
            break;
        case eventTypes.SYNC_START:
            break;
        case eventTypes.FEED_START:
            break;
        case eventTypes.SOURCE_START:
            break;
        case eventTypes.ENTRY_CHANGE:
            this.onEntryChange(event);
            break;
        case eventTypes.ENTRY_DELETION:
            this.onEntryDeletion(event);
            break;
        case eventTypes.ENTRY_KEEP:
            this.onEntryKeep(event);
            break;
        case eventTypes.SOURCE_COMPLETE:
            this.onSourceComplete(event);
            break;
        case eventTypes.FEED_COMPLETE:
            break;
        case eventTypes.SYNC_COMPLETE:
            this.onSyncComplete(event);
            break;
    }
};
/**
 * Sync iteration ends.
 * @private
 */
_ProxyModel.prototype.onSyncComplete = function() {
    var keys = Object.keys(this.changes);
    if(keys.length>0) {
        var _changes = {};
        for(var i=0; i<keys.length; i++) {
            var change = this.changes[keys[i]];
            if(change.type == fjs.fdp.model.EntryChange.CHANGE_TYPE_DELETE || Object.keys(change.entry).length>0) {
                _changes[keys[i]] = this.changes[keys[i]].getJSON();
            }
        }
        this.fireEvent(_ProxyModel.EVENT_TYPE_FEED_CHANGE, {feed:this.feedName, changes:_changes});
    }
    this.changes= {};
};

/**
 * Sends action to FDP - server
 * @param {string} feedName - Feed name
 * @param {string} actionName - Action name
 * @param {Object} data - Request parameters ({'key':'value',...})
 */
_ProxyModel.prototype.sendAction = function(feedName, actionName, data){
    this.sm.sendAction(feedName, actionName, data);
};
})();

