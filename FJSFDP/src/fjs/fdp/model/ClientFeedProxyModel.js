namespace("fjs.fdp.model");
/**
 * Proxy model for client feeds
 * @param {Array.<string>} feeds List of joined feeds
 * @constructor
 * @extends fjs.fdp.model.ProxyModel
 */
fjs.fdp.model.ClientFeedProxyModel = function(feeds) {
    fjs.fdp.model.ProxyModel.call(this, feeds);
    var context = this;
    this.clientFeedName = feeds[feeds.length-1];

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
            this.sm.addFeedListener(this.feeds[i], onSyncEvent, this.feeds[i]== this.clientFeedName);
        }
    };
    /**
     * Removes listeners from sync manager <br>
     * That action ends syncronization for this feeds
     * @private
     */
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.removeFeedListener(this.feeds[i], onSyncEvent, this.feeds[i]== this.clientFeedName);
        }
    };
};
fjs.fdp.model.ClientFeedProxyModel.extend(fjs.fdp.model.ProxyModel);

/**
 * Creates simulated FDP sync object
 * @param {string} syncType
 * @param {Object} entry
 * @returns {Object}
 * @private
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData = function(syncType, entry) {
    var syncData = {};
    entry.xef001type = syncType;
    syncData[this.clientFeedName] = {
        "": {
            "items":[entry]
            , xef001type: "L"
        }
    };
    return syncData;
};
fjs.fdp.model.ClientFeedProxyModel.prototype.onSyncComplete = function(event) {
    if(this.changes) {
        this.fireEvent({feed:this.clientFeedName, changes:this.changes});
    }
    this.changes= null;
};

/**
 * Sends action to FDP server
 * @param {string} feedName Feed name
 * @param {string} actionName Action name ('push' or 'delete')
 * @param {Object} data Request parameters ({'key':'value',...})
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.sendAction = function(feedName, actionName, data) {

    if(actionName==='push' || actionName==='delete') {
        this.sm.onClientSync(fjs.utils.JSON.stringify(this.createSyncData(actionName, data)));
    }
    else {
        this.superClass.sendAction.call(this, this.feedName, actionName, data);
    }
};

fjs.fdp.model.ClientFeedProxyModel.prototype.onEntryDeletion = function(event) {
    if(event.feed == this.feedName) {
        delete this.items[event.xpid];
        this.sendAction(this.clientFeedName, 'delete', {xpid:event.xpid});
    }
    if(event.feed == this.feedName || this.items[event.xpid]) {
        this.fillDeletion(event.xpid, event.feed);
    }
};

fjs.fdp.model.ClientFeedProxyModel.prototype.addListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index<0) {
        this.listeners.push(listener);
        var changes = this.createFullChange();
        if(changes) {
            listener({feed: this.clientFeedName, changes:changes});
        }
    }
    if(!this._attached) {
        this.attach();
        this._attached = true;
    }
};
