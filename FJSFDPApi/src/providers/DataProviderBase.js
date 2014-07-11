namespace("fjs.api");
/**
 * Base FDP Data provider
 * @param {string} ticket - Auth ticket
 * @param {string} node - node Id
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.api.DataProviderBase = function(ticket, node) {
    fjs.EventsSource.call(this);
    this.ticket = ticket;
    this.node = node;
};
fjs.api.DataProviderBase.extend(fjs.EventsSource);


/**
 * Checks provider availability. Returns true if you can use this provider.
 * @returns {boolean}
 */
fjs.api.DataProviderBase.check = function() {
    return false;
};


/**
 * Sends message to synchronization module (FJSFDP)
 * @param {{action:string, data:*}} message - Message
 * @protected
 */
fjs.api.DataProviderBase.prototype.sendMessage = function(message) {

};
/**
 * Adds listener on feed. If feed does not synchronize, adds this feed to synchronization.
 * @param {string} feedName - feed name
 */
fjs.api.DataProviderBase.prototype.addSyncForFeed = function(feedName) {
    this.sendMessage({action:"registerSync", data:{feedName:feedName}});
};

/**
 * Removes listener from feed, if the number of listeners == 0, it stops synchronization for this feed.
 * @param {string} feedName - feed name
 */
fjs.api.DataProviderBase.prototype.removeSyncForFeed = function(feedName) {
    this.sendMessage({action:"unregisterSync", data:{feedName:feedName}});
};
/**
 *  Forgets auth info.
 */
fjs.api.DataProviderBase.prototype.logout = function() {
    this.sendMessage({action:'logout', data:null});
};
/**
 * Sends action to FDP server
 * @param {string} feedName - feed name
 * @param {string} actionName - action name
 * @param {Object} data - action data
 */
fjs.api.DataProviderBase.prototype.sendAction = function(feedName, actionName, data) {
    this.sendMessage({action:'fdp_action', data:{'actionName':actionName, 'params':data}});
};





