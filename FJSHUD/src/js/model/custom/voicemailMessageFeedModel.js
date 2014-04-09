namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.VoicemailMessageFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "voicemailbox", dataManager);
};
fjs.hud.VoicemailMessageFeedModel.extend(fjs.hud.FeedModel);

fjs.hud.VoicemailMessageFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.VoicemailMessageEntryModel(obj, this);
};
fjs.hud.VoicemailMessageFeedModel.prototype.actionJoinMe = function(confId) {
    this.actionJoinContact(confId, this.dataManager.getModel("me").getMyPid());
};
fjs.hud.VoicemailMessageFeedModel.prototype.actionMarkAsRead = function(messageId) {
    //this.fdp.sendAction("voicemailbox", "markAsRead", {"a.messageId":messageId});
};
fjs.hud.VoicemailMessageFeedModel.prototype.actionCallback = function(messageId){
    this.dataManager.sendAction("voicemailbox", "callback", {"a.messageId":messageId});
};
/**
 *
 * @param ids {string} comma separated ids
 * @param read {boolean}
 */
fjs.hud.VoicemailMessageFeedModel.prototype.actionSetReadStatusAll = function(ids, read) {
    this.dataManager.sendAction("voicemailbox", "setReadStatusAll", {"a.ids": ids, "a.read":read});
};
/**
 *
 * @param ids {string}
 */
fjs.hud.VoicemailMessageFeedModel.prototype.actionRemoveReadMessages = function(ids) {
    this.dataManager.sendAction("voicemailbox", "removeReadMessages", {"a.messages": ids});
};