fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.MyCallsFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "mycalls", dataManager);


};
fjs.core.inherits(fjs.hud.MyCallsFeedModel, fjs.hud.FeedModel);


//fjs.hud.MyCallsFeedModel.prototype.onEntryChange = function(data) {
//    var isNew = !this.items[data["xpid"]];
//    fjs.hud.MyCallsFeedModel.super_.prototype.onEntryChange.call(this, data);
//    if(isNew){
//        var conference = this.items[data["xpid"]];
//        for(var memberId in this.conferenceMembersModel.items){
//            if(this.conferenceMembersModel.items.hasOwnProperty(memberId) && (this.conferenceMembersModel.items[memberId]["fdpConferenceId"] == data["xpid"])){
//                conference.addMember(memberId, data.entry);
//            }
//        }
//    }
//};

fjs.hud.MyCallsFeedModel.prototype.createEntry = function(obj) {
    if(obj.contactId) {
        this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+obj.contactId, key:'contact/'+obj.contactId, timestamp:Date.now()});
    }
    return new fjs.hud.MyCallEntryModel(obj);

};