importScripts('fjs.core.debug.js');
importScripts('fjs.fdp.debug.js');
importScripts('properties.js');

var connections = 0;
var ports = [];
var dataManager = null;

var postToPage = function(message) {
    for(var i=0; i<ports.length; i++) {
        if(ports[i] && ports[i].postMessage) {
            ports[i].postMessage(message);
        }
    }
};

self.addEventListener("connect", function (e) {
    var port = e["ports"][0];
    connections++;
    ports.push(port);
    port.addEventListener("message", function (e) {
        handleMessage(e.data, function(data){
            port.postMessage({"eventType":"sync", "data":data});
        });
    }, false);
    port.start();
    port.postMessage({eventType:"ready"});
});

function handleMessage(message, callback) {
    switch(message.action) {
        case "init":
            if(!dataManager) {
                dataManager = new fjs.fdp.DataManager(message.data.ticket, message.data.node, fjs.fdp.CONFIG, function(){});
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
        case "action":
            dataManager.sendAction(message.data.feedName, message.data.actionName, message.data.data);
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