'use strict';
//
//chrome.runtime.onInstalled.addListener(function (details) {
//    console.log('previousVersion', details.previousVersion);
//});
//
//chrome.browserAction.setBadgeText({text: '\'Allo'});
//
//console.log('\'Allo \'Allo! Event Page for Browser Action');

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
        case "showTab":
            chrome.windows.getAll(null, function(windows){
                for(var i=0; i<windows.length; i++) {
                    var window = windows[i];
                    chrome.tabs.getAllInWindow(window.id, function(tabs){
                        for(var i=0; i<tabs.length; i++) {
                            var tab = tabs[i];
                            if(getPath(tab.url) == getPath(request.url)) {
                                chrome.windows.update(window.id, {focused :true});
                                chrome.tabs.update(tab.id, {selected: true});
                                return "ok";
                            }
                        }
                    });
                }
            });
            break;
        case "runApp":
            var url = request.url ? 'https://huc-dev.fonality.com/repository/hudweb/2.0/app/popup.html#/'+request.url : 'https://huc-dev.fonality.com/repository/hudweb/2.0/app/popup.html';
            chrome.windows.create({url:url, focused:true,  type: "panel", width:518, height: 800});
            break;
    }
});

var getPath = function(url) {
    return url.substring(0,url.indexOf("#")+37);
};