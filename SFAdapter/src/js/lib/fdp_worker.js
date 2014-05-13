//we load scripts of libs
importScripts('fjs.core.debug.js');
importScripts('TabsSyncronizer.js');
importScripts('fjs.fdp.debug.js');


var dataManager = null;
self.web_worker = true;
//we listen messages from page
self.addEventListener("message", function(e) {
    handleMessage(e.data, function(data){
        self.postMessage({"eventType":"sync", "data":data});
    });
}, false);

//we send messages to page
var postToPage = function(message) {
    self.postMessage(message);
};

//and we handle this messages
function handleMessage(message, callback) {
    switch(message.action) {
        case "init":
            if(!dataManager) {
                dataManager = new fjs.fdp.DataManager(message.data.ticket, message.data.node, message.data.config, function(){});
                dataManager.addEventListener("", function(e){
                    postToPage(e);
                });
            }
            break;
        case "registerSync":
            dataManager.addFeedListener(message.data.feedName, callback);
            break;
        case "unregisterSync":
            dataManager.removeFeedListener(message.data.feedName, callback);
            break;
        case "fdp_action":
            dataManager.sendAction(message.data.feedName, message.data.actionName, message.data.params);
            break;
        case "logout":
            dataManager.logout();
            break;
        case "SFLogin":
            dataManager.SFLogin(message.data);
            break;
        default:
            console.error("Unknown action: " + message.action);
    }
}
self.postMessage({eventType:"ready"});