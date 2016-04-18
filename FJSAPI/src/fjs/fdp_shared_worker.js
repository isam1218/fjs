importScripts('../../../FJSCore/dist/fjs.core.debug.js');
importScripts('../../../FJSModel/dist/fjs.model.debug.js');
importScripts('../../../FJSDB/dist/fjs.db.debug.js');
importScripts('../../../FJSFDP/dist/fjs.fdp.debug.js');

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
            fjs.utils.Console.error("Unknown action: " + message.action);
    }
}