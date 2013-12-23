namespace("fjs.api");
/**
 * @param {string} ticket
 * @param {string} node
 * @param {*} config
 * @constructor
 */
fjs.api.ClientDataProviderBase = function(ticket, node, config) {
    this.ticket = ticket;
    this.node = node;
    this.config = config;
    this.listeners = {};
};

/**
 * @returns {boolean}
 */
fjs.api.ClientDataProviderBase.check = function() {
    return false;
};


/**
 * @param {string} eventType
 * @param {Function} listener
 */
fjs.api.ClientDataProviderBase.prototype.addListener = function(eventType, listener) {
    if(!this.listeners[eventType]) {
        this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
};

/**
 * @param {string} eventType
 * @param {Function} listener
 */
fjs.api.ClientDataProviderBase.prototype.removeListener = function(eventType, listener) {
    if(this.listeners[eventType]) {
        var index = this.listeners[eventType].indexOf(listener);
        if(index>=0) {
            this.listeners[eventType].splice(index, 1);
        }
    }
};

/**
 * @param {string} eventType
 * @param {*} data
 * @protected
 */
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

fjs.api.ClientDataProviderBase.prototype.logout = function() {
    this.sendMessage({action:'logout', data:null});
};

fjs.api.ClientDataProviderBase.prototype.sendAction = function(feedName, actionName, data) {
    this.sendMessage({action:'fdp_action', data:{'actionName':actionName, 'params':data}});
};


