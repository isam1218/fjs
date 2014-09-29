fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ClientFeedModel = function(feedName, dataManager) {
    fjs.hud.FeedModel.call(this, feedName, dataManager);
};
fjs.core.inherits(fjs.hud.ClientFeedModel, fjs.hud.FeedModel);
