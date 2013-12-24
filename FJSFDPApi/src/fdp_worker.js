importScripts('fjs.core.debug.js');
importScripts('fjs.fdp.debug.js');
importScripts('properties.js');

var dataManager = null;

self.addEventListener("message", function(e) {
    handleMessage(e.data, function(data){
        self.postMessage({"action":"sync", "data":data});
    });
}, false);

var postToPage = function(message) {
    self.postMessage(message);
};


function handleMessage(data, callback) {
    switch(data.action) {
        case "init":
            if(!dataManager) {
                var authHandler = {
                    requestAuth:function() {
                        postToPage({"action":"requestAuth"});
                    }
                    , setNode:function(node){
                        postToPage({"action":"setNode", "data":{"value":node}});
                    }
                };
                dataManager = new fjs.fdp.DataManager(data.data.ticket, data.data.node, self, authHandler, function(){});
            }
            break;
        case "registerSync":
            dataManager.addListener(data.data.feedName, callback);
            break;
        case "action":
            dataManager.sendAction(data.data.feedName, data.data.actionName, data.data.data);
            break;
        case "logout":
            dataManager.logout();
    }
}