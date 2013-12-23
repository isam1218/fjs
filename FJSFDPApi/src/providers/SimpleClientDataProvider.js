namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.ClientDataProviderBase
 */
fjs.api.SimpleClientDataProvider = function(ticket, node, callback) {
    var context = this;
    fjs.api.ClientDataProviderBase.call(this, ticket, node);
    var SYNCHRONIZATION_URL = "js/lib/fjs.fdp.debug.js";
    var script = document.createElement('script');
    this.dataManager = null;

    this.onSync = function(data) {
        context.fireEvent("sync", data);
    };
    this.authHandler = {
        requestAuth: function() {
            context.fireEvent("requestAuth", null);
        }
        , setNode: function(node) {
            context.fireEvent("setNode", {node:node});
        }
    };

    script.onload = function() {
        context.dataManager = new fjs.fdp.DataManager(context.ticket, context.node, window, context.authHandler, function(){});
        callback();
    };
    document.head.appendChild(script);
    script.src = SYNCHRONIZATION_URL;
};
fjs.api.SimpleClientDataProvider.extend(fjs.api.ClientDataProviderBase);

/**
 * @returns {boolean}
 */
fjs.api.SimpleClientDataProvider.check = function() {
    return true;
};

/**
 * @param {{action:string, data:*}} message
 */
fjs.api.SimpleClientDataProvider.prototype.sendMessage = function(message) {
    switch (message.action) {
        case "registerSync":
            this.dataManager.addListener(message.data.feedName, this.onSync);
            break;
        case "unregisterSync":
            this.dataManager.removeListener(message.data.feedName, this.onSync);
            break;
        case "logout":
            this.dataManager.logout();
            break;
        case "fdp_action":
            this.dataManager.sendAction(message.data.feedName, message.data.actionName, message.data.params);
            break;
    }
};

