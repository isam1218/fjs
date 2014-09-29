fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.QuickInboxFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.QuickInboxFeedModel, fjs.hud.FeedModel);

fjs.hud.QuickInboxFeedModel.prototype.onEntry = function(obj) {
    return new fjs.hud.ContactEntryModel(obj);
};
