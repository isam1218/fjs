fjs.core.namespace("fjs.hud");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 * @extends fjs.fdp.QueueEntryModel
 */
fjs.hud.QueueEntryModel = function (obj, dm) {
  this.dataManager = dm;
  fjs.hud.EntryModel.call(this, obj, 'queues');

};
fjs.core.inherits(fjs.hud.QueueEntryModel, fjs.hud.EntryModel);

fjs.hud.QueueEntryModel.prototype.getAvatar = function (memberIds, index, width, height) {
  if (memberIds && memberIds[index]) {
    var xpid = memberIds[index];

    if(xpid) {
      var contact = this.dataManager.getModel('contacts').items[xpid];

      return contact.getAvatarUrl(width, height);
    }
  } else {
    switch (width) {
      case 14:
        return "img/Generic-Avatar-14.png";
      case 28:
        return "img/Generic-Avatar-28.png";
      default:
        return "img/Generic-Avatar-Small.png";
    }
  }
};
