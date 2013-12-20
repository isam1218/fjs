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
    this.listeners = [function(data){console.log(data)}];
    this.sm = new fjs.fdp.SyncManager();
    /**
     * @type {boolean}
     * @private
     */
    this._attached = false;
    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    }
    this.attach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.addListener(this.feeds[i], onSyncEvent);
        }
    }
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.removeListener(this.feeds[i], onSyncEvent);
        }
    }
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

fjs.fdp.ProxyModel.prototype.fillChanges = function(xpid, changes, type) {
    if(!this.changes) {
        this.changes = {};
    }
    var _changes = this.changes[xpid];
    if(!_changes) {
        _changes = this.changes[xpid] = {};
    }
    if(type=='change'&& _changes.type!='delete') {
        _changes.type = 'change';
        for(var key in changes) {
            if(changes.hasOwnProperty(key)) {
                _changes[key] = changes[key];
            }
        }
    }
    else if(type=='delete') {
        _changes.type = 'delete';
    }
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
            /**
             * @type {fjs.fdp.EntryModel}
             */
            var item = this.items[data.xpid];
            if(!item) {
                item = this.items[data.xpid] = new fjs.fdp.EntryModel(data.entry);
                this.fillChanges(data.xpid, data.entry, 'change');
            }
            else {
                var changes = item.fill(data.entry);
                this.fillChanges(data.xpid, changes, 'change');
            }
            break;
        case eventTypes.ENTRY_DELETION:
            if(data.feed == this.feedName) {
                delete this.items[data.xpid];
                this.fillChanges(data.xpid, null, 'delete');
            }
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

