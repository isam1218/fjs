namespace("fjs.fdp");
/**
 * @param {Array} feeds
 * @constructor
 */
fjs.fdp.ProxyModel = function(feeds) {
    var context = this;
    this.items ={};
    this.changes=null;
    this.feeds = feeds;
    this.feedName = feeds[0];
    this.listeners = [];
    this.feedFields = {};

    this.sm = new fjs.fdp.SyncManager();
    /**
     * @type {boolean}
     * @private
     */
    this._attached = false;
    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    };
    this.attach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.addListener(this.feeds[i], onSyncEvent);
        }
    };
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.removeListener(this.feeds[i], onSyncEvent);
        }
    };
};



fjs.fdp.ProxyModel.prototype.addListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index<0) {
        this.listeners.push(listener);
    }
    if(!this._attached) {
        this.attach();
        this._attached = true;
    }
};

fjs.fdp.ProxyModel.prototype.removeListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index>-1) {
        this.listeners.splice(index, 1);
    }
    if(this.listeners.length == 0) {
        this.detach();
        this._attached = false;
    }
};


fjs.fdp.ProxyModel.prototype.fireEvent = function(data) {
    for(var i=0; i<this.listeners.length; i++) {
        this.listeners[i](data);
    }
};
/**
 * @returns {*}
 * @protected
 */
fjs.fdp.ProxyModel.prototype.createChange = function(xpid) {
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
 *
 * @param {string} xpid
 * @param {*} changes
 * @param {string} feedName
 * @protected
 */
fjs.fdp.ProxyModel.prototype.fillChange = function(xpid, changes, feedName) {
    var _changes = this.createChange(xpid);
    _changes.type = 'change';
    for(var key in changes) {
        if(changes.hasOwnProperty(key)) {
            _changes.entry[key] = changes[key];
        }
    }
};
/**
 * @param xpid
 * @param feedName
 * @protected
 */
fjs.fdp.ProxyModel.prototype.fillDeletion= function(xpid, feedName) {
    var _changes = this.createChange(xpid);
    if(feedName==this.feedName) {
        _changes.type = 'delete';
    }
    else {
        var changes = this.feedFields[feedName];
        if(changes) {
            for (var key in changes) {
                if(changes.hasOwnProperty(key)) {
                    _changes.entry[key] = changes[key];
                }
            }
        }
    }
};

fjs.fdp.ProxyModel.prototype.fieldPass = function(feedName, fieldName) {
    return fieldName!='xef001id' && feedName!='xef001iver' && feedName!='xpid';
};

fjs.fdp.ProxyModel.prototype.collectFields = function(feedName, entry) {
    if(feedName!=this.feedName && !this.feedFields[feedName]) {
        this.feedFields[feedName] = {};
        for(var key in entry) {
            if(entry.hasOwnProperty(key))
                if(this.fieldPass(feedName, key)) {
                    this.feedFields[feedName][key] = null;
                }
        }
    }
};

fjs.fdp.ProxyModel.prototype.onEntryChange = function(data) {
    /**
     * @type {fjs.fdp.EntryModel}
     */
    var item = this.items[data.xpid];
    if(!item) {
        this.items[data.xpid] = new fjs.fdp.EntryModel(data.entry);
        this.fillChange(data.xpid, data.entry, data.feed);
    }
    else {
        var changes = item.fill(data.entry);
        this.fillChange(data.xpid, changes, data.feed);
    }
};

fjs.fdp.ProxyModel.prototype.onEntryDeletion = function(data) {
    if(data.feed == this.feedName) {
        delete this.items[data.xpid];
    }
    this.fillDeletion(data.xpid, data.feed);
};

fjs.fdp.ProxyModel.prototype.onSyncEvent = function(data) {
    var eventTypes = fjs.fdp.SyncManager.eventTypes;
    switch(data.eventType) {
        case eventTypes.SYNC_START:
            break;
        case eventTypes.FEED_START:
            break;
        case eventTypes.SOURCE_START:
            break;
        case eventTypes.ENTRY_CHANGE:
            this.onEntryChange(data);
            break;
        case eventTypes.ENTRY_DELETION:
            this.onEntryDeletion(data);
            break;
        case eventTypes.SOURCE_COMPLETE:
            break;
        case eventTypes.FEED_COMPLETE:
            break;
        case eventTypes.SYNC_COMPLETE:
            if(this.changes) {
                this.fireEvent({feed:this.feedName, changes:this.changes});
            }
            this.changes= null;
            break;
    }
};


fjs.fdp.ProxyModel.prototype.sendAction = function(feedName, actionName, data){
    this.sm.sendAction(feedName, actionName, data, function(){
    });
}


