namespace("fjs.hud");
/**
 * @param {fjs.hud.FDPDataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ContactsFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "contacts", dataManager);
};
fjs.hud.ContactsFeedModel.extend(fjs.hud.FeedModel);

fjs.hud.ContactsFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.ContactEntryModel(obj);
};
