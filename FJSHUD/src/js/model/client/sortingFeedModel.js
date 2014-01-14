namespace("fjs.hud");
/**
 * @param {fjs.hud.FDPDataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.SortingFeedModel = function(dataManager) {
    fjs.hud.ClientFeedModel.call(this, "sorting", dataManager);
};
fjs.hud.SortingFeedModel.extend(fjs.hud.ClientFeedModel);