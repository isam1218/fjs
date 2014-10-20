fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.CalllogFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "calllog", dataManager);
};
fjs.core.inherits(fjs.hud.CalllogFeedModel, fjs.hud.FeedModel);

fjs.hud.CalllogFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.CalllogEntryModel(obj);
};
