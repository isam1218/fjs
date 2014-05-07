//importScripts('sf.js');
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
    console.log("!!!!!!1");
    var port = e["ports"][0];
    connections++;
    ports.push(port);
    port.addEventListener("message", function (e) {
        console.log("!!!!!! message");
        handleMessage(e.data, function(data){
            port.postMessage(data);
        });
    }, false);
    port.start();
    port.postMessage({eventType:"ready"});
    console.log("!!!!!!ready");
});

function handleMessage(message) {
    console.log("!!!!!!1", message);
    switch (message.action) {
        case "init":
//            if(!sfApi) {
//                sfApi = new SFApi();
//            }
            break;
        case "enableCalls":
//            sfApi.enableCalls(message.data.isReg, function(e){
//                postToPage({eventType:'enableCalls', id: message.id, data:e});
//            });
            break;
        case "addCallLog":
//            sfApi.addCallLog(message.data.subject, message.data.whoId, message.data.whatId, message.data.note, message.data.callType,
//                message.data.duration, message.id, message.data.date,  function(e){
//                    postToPage({eventType:'addCallLog', id: message.id, data:e});
//                });
            break;
        case "getPhoneInfo":
//            sfApi.getPhoneInfo(message.data.phone, message.data.callType, message.data.isRinging, function(e){
//                postToPage({eventType:'getPhoneInfo', id: message.id, data:e});
//            });
            break;
        case "getCalllogCommentField":
//            sfApi.getCalllogCommentField(function(e){
//                postToPage({eventType:'getCalllogCommentField', id: message.id, data:e});
//            });
            break;
        case "getLoginInfo":
//            sfApi.getLoginInfo(function(e){
//                postToPage({eventType:'getLoginInfo', id: message.id, data:e});
//            });
//            break;
//        case "setSoftphoneHeight":
//            sfApi.setSoftphoneHeight(message.data.height, function(e){
//                postToPage({eventType:'setSoftphoneHeight', id: message.id, data:e});
//            });
//            break;
//        case "setSoftphoneWidth":
//            sfApi.setSoftphoneWidth(message.data.width, function(e){
//                postToPage({eventType:'setSoftphoneWidth', id: message.id, data:e});
//            });
//            break;
//        case "setPhoneApi":
//            sfApi.setPhoneApi(message.data.isPhoneReg, function(e){
//                postToPage({eventType:'setPhoneApi', id: message.id, data:e});
//            });
//            break;
    }
}