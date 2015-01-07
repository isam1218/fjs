fjs.core.namespace("fjs.hud");

/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.QueueMemberFeedModel = function (dataManager) {
  this.dataManager = dataManager;
  fjs.hud.FeedModel.call(this, "queue_members", dataManager);
};
fjs.core.inherits(fjs.hud.QueueMemberFeedModel, fjs.hud.FeedModel);

fjs.hud.QueueMemberFeedModel.prototype.createEntry = function (obj) {
  return new fjs.hud.QueueMemberEntryModel(obj, this.dataManager);
};

fjs.hud.QueueMemberFeedModel.prototype.onEntryChange = function (data) {
  var isNew = !this.items[data["xpid"]];

  fjs.hud.QueueMemberFeedModel.super_.prototype.onEntryChange.call(this, data);

  if (isNew) {
    var member = this.items[data["xpid"]];

    if(member.contactId) {
      member.contact = this.dataManager.getModel('contacts').items[member.contactId];
    }
  }
};
