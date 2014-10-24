fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.QueueFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "queues", dataManager);
};
fjs.core.inherits(fjs.hud.QueueFeedModel, fjs.hud.FeedModel);

fjs.hud.QueueFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.QueueEntryModel(obj);
};
