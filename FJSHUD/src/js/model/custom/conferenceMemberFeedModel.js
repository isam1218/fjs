namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ConferenceMemberFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "conferencemembers", dataManager);
    this.dataManager = dataManager;
};
fjs.hud.ConferenceMemberFeedModel.extend(fjs.hud.FeedModel);

fjs.hud.ConferenceMemberFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.ConferenceMemberEntryModel(obj, this);
};