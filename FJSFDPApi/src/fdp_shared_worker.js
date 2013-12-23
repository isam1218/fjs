importScripts('fjs.core.debug.js');
importScripts('fjs.fdp.debug.js');
importScripts('properties.js');

var connections = 0;
var ports = [];

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
            port.postMessage({"action":"sync", "data":data});
        });
    }, false);
});

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
            dataManager.addListener(data.feedName, callback);
            break;
        case "action":
            dataManager.sendAction(data.data.feedName, data.data.actionName, data.data.data);
            break;
        case "logout":
            dataManager.logout();
    }
};