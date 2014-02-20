/**
 * @interface
 */
fjs.api.IDataProvider = function() {

};
/**
 * @param {string} eventType
 * @param {Function} listener
 */
fjs.api.IDataProvider.prototype.addListener = function(eventType, listener){};

/**
 * @param {string} eventType
 * @param {Function} listener
 */
fjs.api.IDataProvider.prototype.removeListener = function(eventType, listener){};

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