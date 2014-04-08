/**
 * @interface
 */
fjs.api.IDataProvider = function() {

};

/**
 * @param {string} feedName
 */
fjs.api.IDataProvider.prototype.addSyncForFeed = function(feedName){};

/**
 * @param {string} feedName
 */
fjs.api.IDataProvider.prototype.removeSyncForFeed = function(feedName){};

/**
 * @param {string} feedName
 * @param {string} actionName
 * @param {*} data
 */
fjs.api.IDataProvider.prototype.sendAction = function(feedName, actionName, data){};