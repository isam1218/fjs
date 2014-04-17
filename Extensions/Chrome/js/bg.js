//var syncManager = new fjs.fdp.SyncManager(new fjs.db.IndexedDBProvider(self));
//var ticket =null, node = null, server = null;
var sendResponse = function(data) {
    chrome.tabs.getAllInWindow(window.id, function(tabs){
        chrome.windows.getAll(null, function(windows){
            for(var i=0; i<windows.length; i++) {
                var window = windows[i];
                chrome.tabs.getAllInWindow(window.id, function(tabs){
                    for(var i=0; i<tabs.length; i++) {
                        var tab = tabs[i];
                        chrome.tabs.sendMessage(tab.id, data, function(){

                        });
                    }
                });
            }
        });
    });
};

chrome.extension.onMessage.addListener(function(data, sender, sendResponse) {
    switch(data.action) {
        case "init":
            if(syncManager.state == fjs.fdp.SyncManager.NOT_INITIALIZED) {
                var authHandler = {
                    requestAuth:function() {
                        sendResponse({"action":"unauthorized"});
                    }
                    , node:function(node) {
                        sendResponse({"action":"node", "value":node});
                        fj.fdp.phone.Api.getInstance().login(ticket, node, server);
                    }
                };
                syncManager.init(ticket = data.data.ticket, node = data.data.node, server = data.data.serverURL, new fjs.Ajax(), authHandler);
                if(node) {
                    fj.fdp.phone.Api.getInstance().login(ticket, node, server);
                }

            }
            break;
        case "redisterSync":
            syncManager.addListener(data.feedName, function(data){
                chrome.tabs.sendMessage(sender.tab.id, {"action":"sync", "data":data}, function(){

                });
            });
            break;
        case "action":
            syncManager.sendAction(data.data.feedName, data.data.actionName, data.data.data);
            break;
        case "logout":
            syncManager.logout();
            break;
        case "runApp":
            var url = data.url ? 'https://dev4.fon9.com/repository/demo/popup.html#/'+data.url : 'https://dev4.fon9.com/repository/demo/popup.html';
            chrome.windows.create({url:url, focused:true,  type: "panel", width:518, height: 800});
            break;
    }
});

function onReady ( callback ){
    var addListener = document.addEventListener || document.attachEvent,
        removeListener =  document.removeEventListener || document.detachEvent
    eventName = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange"

    addListener.call(document, eventName, function(){
        removeListener(eventName, arguments.callee, false)
        callback()
    }, false )
}

onReady(function() {
    fj.fdp.phone.Api.init();
});
;
