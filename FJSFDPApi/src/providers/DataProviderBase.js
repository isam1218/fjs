namespace("fjs.api");
/**
 * @param {string} ticket
 * @param {string} node
 * @param {*} config
 * @constructor
 * @implements fjs.api.IDataProvider
 * @extends fjs.EventsSource
 */
fjs.api.DataProviderBase = function(ticket, node, config) {
    fjs.EventsSource.call(this);
    this.ticket = ticket;
    this.node = node;
    this.config = config;
    this.listeners = {};
};
fjs.api.DataProviderBase.extend(fjs.EventsSource);


/**
 * @returns {boolean}
 */
fjs.api.DataProviderBase.check = function() {
    return false;
};


/**
 * @param {{action:string, data:*}} message
 * @protected
 */
fjs.api.DataProviderBase.prototype.sendMessage = function(message) {

};
/**
 * @param {string} feedName
 */
fjs.api.DataProviderBase.prototype.addSyncForFeed = function(feedName) {
    this.sendMessage({action:"registerSync", data:{feedName:feedName}});
};

/**
 * @param {string} feedName
 */
fjs.api.DataProviderBase.prototype.removeSyncForFeed = function(feedName) {
    this.sendMessage({action:"unregisterSync", data:{feedName:feedName}});
};

fjs.api.DataProviderBase.prototype.logout = function() {
    this.sendMessage({action:'logout', data:null});
};

fjs.api.DataProviderBase.prototype.sendAction = function(feedName, actionName, data) {
    this.sendMessage({action:'fdp_action', data:{'actionName':actionName, 'params':data}});
};





