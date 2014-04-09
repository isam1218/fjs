//we load scripts of libs
importScripts('fjs.core.debug.js');
importScripts('fjs.fdp.debug.js');
importScripts('properties.js');

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
function handleMessage(data, callback) {
    switch(data.action) {
        case "init":
            if(!dataManager) {
                dataManager = new fjs.fdp.DataManager(data.data.ticket, data.data.node, self, authHandler, function(){});
                dataManager.addEventListener("", function(e){
                    postToPage(e);
                });
            }
            break;
        case "registerSync":
            dataManager.addFeedListener(data.data.feedName, callback);
            break;
        case "unregisterSync":
            dataManager.removeFeedListener(data.data.feedName, callback);
            break;
        case "action":
            dataManager.sendAction(data.data.feedName, data.data.actionName, data.data.data);
            break;
        case "logout":
            dataManager.logout();
            break;
        case "SFLogin":
            dataManager.SFLogin(message.data);
            break;
    }
}