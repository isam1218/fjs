fjs.core.namespace("fjs.api");

/**
 * @param {string} ticket
 * @param {string} node
 * @param {Function} callback
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.SimpleClientDataProvider = function(ticket, node, config, callback) {
    var context = this;
    fjs.api.DataProviderBase.call(this, ticket, node, config);
    var SYNCHRONIZATION_URL = "../bower_components/FJSFDP/dist/fjs.fdp.debug.js";
    var script = document.createElement('script');
    /**
     * @type {fjs.fdp.DataManager}
     */
    this.dataManager = null;

    this.onSync = function(data) {
        context.fireEvent("sync", data);
    };


    script.onload = function() {
        context.dataManager = new fjs.fdp.DataManager(context.ticket, context.node, context.config, function(){});
        context.dataManager.addEventListener("", function(e) {
            context.fireEvent(e.eventType, e);
        });
        callback();
    };
    document.head.appendChild(script);
    script.src = SYNCHRONIZATION_URL;
};

fjs.core.inherits(fjs.api.SimpleClientDataProvider, fjs.api.DataProviderBase);

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
            this.dataManager.addFeedListener(message.data.feedName, this.onSync);
            break;
        case "unregisterSync":
            this.dataManager.removeFeedListener(message.data.feedName, this.onSync);
            break;
        case "logout":
            this.dataManager.logout();
            break;
        case "fdp_action":
            this.dataManager.sendAction(message.data.feedName, message.data.actionName, message.data.params);
            break;
        case "SFLogin":
            this.dataManager.SFLogin(message.data);
            break;
        default:
            fjs.utils.Console.error("Unknown action: " + message.action);
    }
};

