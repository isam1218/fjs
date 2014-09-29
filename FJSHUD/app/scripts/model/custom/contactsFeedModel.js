fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ContactsFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ContactsFeedModel, fjs.hud.FeedModel);

fjs.hud.ContactsFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.ContactEntryModel(obj);
};
