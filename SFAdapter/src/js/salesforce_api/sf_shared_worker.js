importScripts('sf_api.js');
var connections = 0;
var ports = [];
var sfApi = null;

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
            port.postMessage(data);
        });
    }, false);
    port.start();
    port.postMessage({eventType:"ready"});
});

function handleMessage(message, callback) {
    switch (message.action) {
        case "init":
            if(!sfApi) {
                sfApi = new SFApi();
            }
            break;
        case "enableCalls":
            sfApi.enableCalls(message.data.isReg, function(e){
                postToPage({type:'enableCalls', data:e});
            });
            break;
        case "addCallLog":
            sfApi.addCallLog(message.data.subject, message.data.whoId, message.data.whatId, message.data.note, message.data.callType,
                message.data.duration, message.data.date, message.callback);
            break;
        case "getPhoneInfo":
            sfApi.getPhoneInfo(message.data.phone, message.data.callType, message.data.isRinging, message.callback);
            break;
        case "getCalllogCommentField":
            sfApi.getCalllogCommentField(message.callback);
            break;
        case "getLoginInfo":
            sfApi.getLoginInfo(message.callback);
            break;
        case "setSoftphoneHeight":
            sfApi.setSoftphoneHeight(message.data.height, message.callback);
            break;
        case "setSoftphoneWidth":
            sfApi.setSoftphoneWidth(message.data.width, message.callback);
            break;
        case "setPhoneApi":
            sfApi.setPhoneApi(message.data.isPhoneReg, message.callback);
            break;
    }
}