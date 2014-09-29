fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ConferenceMemberFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "conferencemembers", dataManager);
    this.dataManager = dataManager;
};
fjs.core.inherits(fjs.hud.ConferenceMemberFeedModel, fjs.hud.FeedModel);

fjs.hud.ConferenceMemberFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.ConferenceMemberEntryModel(obj, this);
};