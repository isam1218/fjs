namespace("fjs.fdp");
/**
 * Proxy model for client feeds
 * @param {Array.<string>} feeds List of joined feeds
 * @constructor
 * @extends fjs.fdp.ProxyModel
 */
fjs.fdp.ClientProxyModel = function(feeds) {
    fjs.fdp.ProxyModel.call(this, feeds);
    var context = this;

    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    };
    /**
     * Adds listeners to sync manager. <br>
     * That action initiates syncronization for this feeds
     * @private
     */
    this.attach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.addFeedListener(this.feeds[i], onSyncEvent, true);
        }
    };
    /**
     * Removes listeners from sync manager <br>
     * That action ends syncronization for this feeds
     * @private
     */
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.removeFeedListener(this.feeds[i], onSyncEvent, true);
        }
    };
};
fjs.fdp.ClientProxyModel.extend(fjs.fdp.ProxyModel);

/**
 * Creates simulated FDP sync object
 * @param {string} syncType
 * @param {Object} entry
 * @returns {Object}
 * @private
 */
fjs.fdp.ClientProxyModel.prototype.createSyncData = function(syncType, entry) {
    var syncData = {};
    entry.xef001type = syncType;
    syncData[this.feedName] = {
        "": {
            "items":[entry]
        }
    };
    return syncData;
};

/**
 * Sends action to FDP server
 * @param {string} feedName Feed name
 * @param {string} actionName Action name ('push' or 'delete')
 * @param {Object} data Request parameters ({'key':'value',...})
 */
fjs.fdp.ClientProxyModel.prototype.sendAction = function(feedName, actionName, data) {
    this.sm.onClientSync(fjs.utils.JSON.stringify(this.createSyncData(actionName, data)));
};
