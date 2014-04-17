var extensionObject = document.getElementById("extensionObject");
if(!extensionObject) {
    extensionObject = document.createElement("div");
    extensionObject.id = "extensionObject";
    document.body.appendChild(extensionObject);
    document.getElementById("extensionObject");
};

document.addEventListener('FonExtensionEvent', function(e){
    chrome.extension.sendMessage(e.detail, function(response) {

    });
}, false, true);

var sendMessage=function(data) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("PluginExtensionEvent", true, true, data);
    extensionObject.dispatchEvent(event);
};

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    sendMessage(data);
});
