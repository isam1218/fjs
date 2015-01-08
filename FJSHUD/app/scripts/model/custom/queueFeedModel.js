fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.QueueFeedModel = function (dataManager) {
  this.dataManager = dataManager;
  fjs.hud.FeedModel.call(this, "queues", dataManager);
};
fjs.core.inherits(fjs.hud.QueueFeedModel, fjs.hud.FeedModel);

fjs.hud.QueueFeedModel.prototype.createEntry = function (obj) {
  return new fjs.hud.QueueEntryModel(obj, this.dataManager);
};

//fjs.hud.QueueFeedModel.prototype.onEntryChange = function (data) {
//  var isNew = !this.items[data["xpid"]];
//
//  fjs.hud.QueueFeedModel.super_.prototype.onEntryChange.call(this, data);
//
//  if (isNew) {
//    var queue = this.items[data["xpid"]];
//
//    queue.stats = this.dataManager.getModel("queue_stat_calls").items[queue.xpid];
//    //for (var queueId in this.queueMembersModel.items) {
//    //  if (this.queueMembersModel.items.hasOwnProperty(queueId) && (this.queueMembersModel.items[queueId]["fdpQueueId"] == data["xpid"])) {
//    //    queue.addMember(queueId, data.entry);
//    //  }
//    //}
//  }
//};
