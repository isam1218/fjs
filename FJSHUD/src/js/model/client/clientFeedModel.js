namespace("fjs.hud");
/**
 * @param {fjs.hud.FDPDataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ClientFeedModel = function(feedName, dataManager) {
    fjs.hud.FeedModel.call(this, feedName, dataManager);
};
fjs.hud.ClientFeedModel.extend(fjs.hud.FeedModel);