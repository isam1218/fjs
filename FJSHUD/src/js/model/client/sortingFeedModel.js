namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.SortingFeedModel = function(dataManager) {
    fjs.hud.ClientFeedModel.call(this, "sortings", dataManager);
};
fjs.hud.SortingFeedModel.extend(fjs.hud.ClientFeedModel);
fjs.hud.SortingFeedModel.prototype.actionSort = function(key, value) {
    var entry = {'xpid': key, 'value': value};
    this.dataManager.sendAction("sortings", "sort", {'xpid':key, 'entry':entry});
};