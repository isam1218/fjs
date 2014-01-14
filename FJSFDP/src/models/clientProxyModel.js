namespace("fjs.fdp");
/**
 * @param {Array} feeds
 * @constructor
 */
fjs.fdp.ClientProxyModel = function(feeds) {
    fjs.fdp.ProxyModel.call(this, feeds);
    var context = this;

    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    };
    this.attach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.fillDbData(this.feeds[i], onSyncEvent);
        }
    };
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.fillDbData(this.feeds[i], onSyncEvent);
        }
    };
};
fjs.fdp.ClientProxyModel.extend(fjs.fdp.ProxyModel);


/**
 * @param {string} feedName
 * @param {string} actionName
 * @param {*} data
 */
fjs.fdp.ClientProxyModel.prototype.sendAction = function(feedName, actionName, data) {
    var context = this;
    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    };
    this.sm.insertDbEntry(feedName, data, onSyncEvent);
};
