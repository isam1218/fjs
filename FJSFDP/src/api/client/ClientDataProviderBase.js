namespace("fjs.api");
/**
 * @constructor
 */
fjs.api.ClientDataProviderBase = function(ticket, node, config) {
    this.ticket = ticket;
    this.node = node;
    this.config = config;
    this.listeners = {};
};

fjs.api.ClientDataProviderBase.prototype.addListener = function(eventType, listener) {
    if(!this.listeners[eventType]) {
        this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
};

fjs.api.ClientDataProviderBase.prototype.removeListener = function(eventType, listener) {
    if(this.listeners[eventType]) {
        var index = this.listeners[eventType].indexOf(listener);
        if(index>=0) {
            this.listeners[eventType].splice(index, 1);
        }
    }
};

fjs.api.ClientDataProviderBase.prototype.fireEvent = function(eventType, data) {
    if(this.listeners[eventType]) {
        for(var i=0; i<this.listeners[eventType].length; i++) {
            this.listeners[eventType][i](data);
        }
    }
};
/**
 * @param {{action:string, data:*}} message
 */
fjs.api.ClientDataProviderBase.prototype.sendMessage = function(message) {

};
/**
 * @param {string} feedName
 */
fjs.api.ClientDataProviderBase.prototype.addSyncForFeed = function(feedName) {
    this.sendMessage({action:"registerSync", data:{feedName:feedName}});
};

/**
 * @param {string} feedName
 */
fjs.api.ClientDataProviderBase.prototype.removeSyncForFeed = function(feedName) {
    this.sendMessage({action:"unregisterSync", data:{feedName:feedName}});
};

