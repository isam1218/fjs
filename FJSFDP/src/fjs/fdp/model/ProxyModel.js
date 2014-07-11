namespace("fjs.fdp.model");
/**
 * Base proxy model. <br/>
 * It combines joined feeds, monitors and collect changes and sends changed fields only.
 * @param {Array.<string>} feeds - List of joined feeds (parent feed first)
 * @param {fjs.fdp.SyncManager} syncManager - Synchronization manager
 * @constructor
 */
fjs.fdp.model.ProxyModel = function(feeds, syncManager) {
    var context = this;
    /**
     * @type {Object}
     */
    this.items ={};
    this.keepEntries={};
    this.changes=null;
    this.feeds = feeds;
    this.feedName = feeds[0];
    this.listeners = [];
    this.feedFields = {};

    this.sm = syncManager;
    /**
     * @type {boolean}
     * @private
     */
    this._attached = false;
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


/**
 * Adds event handler function to feed changes
 * @param {Function} listener - Event handler, method to execute when fdp data changed.
 */
fjs.fdp.model.ProxyModel.prototype.addListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index < 0) {
        this.listeners.push(listener);
        var changes = this.createFullChange();
        if(changes) {
            listener({feed: this.feedName, changes:changes});
        }
        if(!this._attached) {
            this.attach();
            this._attached = true;
        }
    }
    else {
        fjs.utils.Console.warn("Trying to add duplicated listener");
    }
};

/**
 * Removes listener function from feed
 * @param {Function} listener Event handler, method to execute when fdp data changed.
 */
fjs.fdp.model.ProxyModel.prototype.removeListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index >- 1) {
        this.listeners.splice(index, 1);
        if(this.listeners.length == 0) {
            this.detach();
            this._attached = false;
        }
    }
    else {
        fjs.utils.Console.warn("Trying to remove unexisted listener");
    }
};

/**
 * Sends event to listeners
 * @param {Object} event Event object ({feed:string, changes:{xpid:entry}})
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.fireEvent = function(event) {
    var clonedArray = this.listeners.slice(0);
    for(var i=0; i<clonedArray.length; i++) {
        if(this.listeners.indexOf(clonedArray[i])>-1) {
            clonedArray[i](event);
        }
    }
};
/**
 * Creates a template object for change
 * @returns {{xpid:string, entry:{}}}
 * @private
 */
fjs.fdp.model.ProxyModel.prototype.createChange = function(xpid) {
    if(!this.changes) {
        this.changes = {};
    }
    var _changes = this.changes[xpid];
    if(!_changes) {
        _changes = this.changes[xpid] = {xpid:xpid, entry:{}};
    }
    return _changes;
};

/**
 * Creates changes object with all existed items.
 * @returns {Object | null}
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.createFullChange = function() {
    var _changes = {}, entriesCount=0;
    for(var key in this.items) {
        if(this.items.hasOwnProperty(key)) {
            _changes[key] = {xpid:key, entry:this.items[key], type:'change'};
            entriesCount++;
        }
    }
    if(entriesCount>0)
    return _changes;
    else return null;
};

/**
 * Applies changes form fdp 'push' entry, and updates changes object.
 * @param {string} xpid XPID of changed entry
 * @param {Object} changes Object with FDP changes.
 * @param {string} feedName Feed name
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.fillChange = function(xpid, changes, feedName) {
    this.collectFields(feedName, changes);
    var _changes = this.createChange(xpid);
    if(_changes.type!='delete') {
        _changes.type = 'change';
        for (var key in changes) {
            if (changes.hasOwnProperty(key)) {
                if (this.fieldPass(feedName, key, true)) {
                    _changes.entry[key] = changes[key];
                }
            }
        }
    }
    else {
        fjs.utils.Console.error('Change for deleted entry');
    }
    return _changes;
};
/**
 * Applies changes form fdp 'delete' entry, and updates changes object.
 * @param xpid XPID of deleted entry
 * @param feedName Feed name
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.fillDeletion= function(xpid, feedName) {
    var _changes = this.createChange(xpid);
    if(feedName==this.feedName) {
        _changes.type = 'delete';
        _changes.entry = null;
    }
    else {
        if(_changes.type == 'delete') return _changes;
        _changes.type = 'change';
        var nullValues = this.feedFields[feedName];
        if(nullValues) {
            if(this.items[xpid]) {
                for (var key in nullValues) {
                    if(nullValues.hasOwnProperty(key)) {
                        if(key in this.items[xpid]) {
                            delete this.items[xpid][key];
                            _changes.entry[key] = nullValues[key];
                        }
                    }
                }
            }
            else {
                fjs.utils.Console.error('Trying to remove unexisted element:', xpid);
            }
            if(fjs.utils.JSON.isEmpty(_changes.entry)) {
                delete this.changes[xpid];
                _changes = null;
                if(fjs.utils.JSON.isEmpty(this.changes)) {
                    this.changes = null;
                }
            }
        }
    }
    return _changes;
};

/**
 * @param {string} feedName
 * @param {string} fieldName
 * @param {string} saveXpid
 * @returns {boolean}
 * @private
 */
fjs.fdp.model.ProxyModel.prototype.fieldPass = function(feedName, fieldName, saveXpid) {
    if(feedName!=this.feedName) {
        return fieldName!=feedName+'_xef001id'
        && fieldName!=feedName+'_xef001iver'
        && fieldName!=feedName+'_xef001type'
        && fieldName!=feedName+'_xpid'
        && fieldName!=feedName+'_source'
        && (fieldName!='xpid' || saveXpid)
    }
    else {
        return (fieldName!='xpid' || saveXpid) && fieldName!='xef001id' && fieldName!='xef001iver' && fieldName!='xef001type' && fieldName!='source';
    }
};
/**
 * Collects field names from joined feeds, then to remove them if joined feed entry deleted
 * @param {string} feedName Feed name
 * @param {Object} entry FDP Feed entry
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.collectFields = function(feedName, entry) {
    if(feedName != this.feedName && !this.feedFields[feedName]) {
        this.feedFields[feedName] = {};
        for(var key in entry) {
            if(entry.hasOwnProperty(key)) {
                if(this.fieldPass(feedName, key, false)) {
                    this.feedFields[feedName][key] = null;
                }
            }
        }
    }
};
/**
 * Updates field names for joined feed as (feedName+"_"+fieldName)
 * @param {Object} entry
 * @param {string} feedName
 * @param {string} xpid
 * @returns {Object}
 * @private
 */
fjs.fdp.model.ProxyModel.prototype.prepareEntry = function(entry, feedName, xpid) {
    var preparedEntry = {}, key;
    var prefix = (feedName!=this.feedName ? (feedName + "_") : "");
        for(key in entry) {
            if (entry.hasOwnProperty(key)) {
                preparedEntry[prefix + key] = entry[key];
            }
        }
    preparedEntry.xpid = xpid;
    return preparedEntry;
};
/**
 * Handler of that entry has changed
 * @param {Object} event - Event object
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.onEntryChange = function(event) {
    /**
     * @type {fjs.fdp.model.EntryModel}
     */
    var item = this.items[event.xpid];
    var _entry = this.prepareEntry(event.entry, event.feed, event.xpid);
    if(!item) {
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
fjs.fdp.model.ProxyModel.prototype.onEntryDeletion = function(event) {
    if(event.feed == this.feedName) {
        delete this.items[event.xpid];
    }
    this.fillDeletion(event.xpid, event.feed);
};
/**
 * @param {Object} event
 */
fjs.fdp.model.ProxyModel.prototype.onEntryKeep = function(event) {
    this.keepEntries[event.xpid] = event;
};


/**
 * @param {Object} event
 */
fjs.fdp.model.ProxyModel.prototype.onSourceComplete = function(event) {
    if(event.syncType==fjs.fdp.SyncManager.syncTypes.FULL || event.syncType==fjs.fdp.SyncManager.syncTypes.KEEP) {
        for(var key in this.items) {
            if(this.items.hasOwnProperty(key) && event.sourceId == this.items[key].source && !this.keepEntries[key]) {
                var _event = {eventType: fjs.fdp.SyncManager.eventTypes.ENTRY_DELETION, feed:event.feed, xpid: key, entry: null};
                this.onEntryDeletion(_event);
            }
        }
    }
    this.keepEntries = {};
};

fjs.fdp.model.ProxyModel.prototype.clear = function() {
    this.changes = {};
    for(var xpid in this.items) {
        if(this.items.hasOwnProperty(xpid)) {
            this.changes[xpid] = {type:'delete', entry:null, xpid:xpid};
            delete this.items[xpid];
        }
    }
    this.onSyncComplete();
};

/**
 * Handler of SyncManager events
 * @param event Event object
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.onSyncEvent = function(event) {
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

fjs.fdp.model.ProxyModel.prototype.onSyncComplete = function() {
    if(this.changes) {
        this.fireEvent({feed:this.feedName, changes:this.changes});
    }
    this.changes= null;
};

/**
 * Sends action to FDP server
 * @param {string} feedName Feed name
 * @param {string} actionName Action name
 * @param {Object} data Request parameters ({'key':'value',...})
 */
fjs.fdp.model.ProxyModel.prototype.sendAction = function(feedName, actionName, data){
    this.sm.sendAction(feedName, actionName, data);
};


