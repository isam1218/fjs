fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.WidgetHistoryFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "widget_history", dataManager);
    var quickIndoxModel = this.dataManager.getModel("quickinbox"), context = this;
    this.quickInboxBySenderId = {};
    quickIndoxModel.addEventListener("push", function(event) {
        var entry = event.entry, _message;
            if(entry.senderId) {
                var item = context.items['contact_'+entry.senderId];
                if(entry.type == 'vm') {
                    _message = "new voicemail";
                }
                else if(entry.type == 'missed-call') {
                    _message = "missed call"
                }

                if(!item) {
                    context.dataManager.sendAction("widget_history", "push", {
                        xpid: 'contact_' + entry.senderId,
                        key: 'contact/' + entry.senderId,
                        events:[entry.xpid],
                        message: entry.message || _message,
                        timestamp: entry.data
                    });
                }
                else {
                    if(!item.events) {
                        item.events = []
                    }
                    if(!item.message) {
                        item.message = "";
                    }
                    var index = item.events.indexOf(entry.xpid);
                    if(index<0) {
                        item.events.push(entry.xpid);
                    }
                    item.timestamp = entry.data;

                    context.dataManager.sendAction("widget_history", "push", {
                        xpid: item.xpid,
                        key: item.key,
                        events:item.events,
                        message: entry.message || _message,
                        timestamp: entry.data
                    });
                }
            }
    });
    quickIndoxModel.addEventListener("delete", function(event){
        var entry = event.entry;
        if(entry && entry.senderId) {
            var item = context.items['contact_'+entry.senderId];
            if(item && item.events) {
                var index = item.events.indexOf(event.xpid);
               if(index>-1) {
                 item.events.splice(index, 1);
               }
                context.dataManager.sendAction("widget_history", "push", {
                    xpid: item.xpid,
                    key: item.key,
                    events:item.events,
                    message: item.message,
                    timestamp: Date.now()
                });
            }
        }
    });
    quickIndoxModel.addEventListener("complete", function(e) {
        context.fireEvent('complete', e);
    });
};
fjs.core.inherits(fjs.hud.WidgetHistoryFeedModel, fjs.hud.FeedModel);

fjs.hud.WidgetHistoryFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.WidgetHistoryEntryModel(obj, this.dataManager);
};