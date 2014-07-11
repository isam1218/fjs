namespace("fjs.api");

/**
 * Data provider works directly in the page.
 * @param {string} ticket - Auth ticket
 * @param {string} node - node Id
 * @param {Function} callback - Data provider ready event handler
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.SimpleClientDataProvider = function(ticket, node, callback) {
    var context = this;
    fjs.api.DataProviderBase.call(this, ticket, node);
    var SYNCHRONIZATION_URL = "js/lib/fjs.fdp.debug.js";
    var script = document.createElement('script');
    /**
     * @type {fjs.fdp.DataManager}
     */
    this.dataManager = null;

    this.onSync = function(data) {
        context.fireEvent("sync", data);
    };


    script.onload = function() {
        context.dataManager = new fjs.fdp.DataManager(context.ticket, context.node, fjs.fdp.CONFIG, function(){});
        context.dataManager.addEventListener("", function(e) {
            context.fireEvent(e.eventType, e);
        });
        callback();
    };
    document.head.appendChild(script);
    script.src = SYNCHRONIZATION_URL;
};
fjs.api.SimpleClientDataProvider.extend(fjs.api.DataProviderBase);

/**
 * Checks provider availability. Returns true if you can use this provider.
 * @returns {boolean}
 */
fjs.api.SimpleClientDataProvider.check = function() {
    return true;
};

/**
 * Sends message to synchronization module (FJSFDP)
 * @param {{action:string, data:*}} message - Message
 * @protected
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

