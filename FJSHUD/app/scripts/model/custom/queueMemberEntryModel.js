fjs.core.namespace("fjs.hud");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 * @extends fjs.fdp.QueuemMemberEntryModel
 */
fjs.hud.QueueMemberEntryModel = function (obj, dm) {
  this.dataManager = dm;
  fjs.hud.EntryModel.call(this, obj, 'queue_members');

};
fjs.core.inherits(fjs.hud.QueueMemberEntryModel, fjs.hud.EntryModel);

fjs.hud.QueueMemberEntryModel.prototype.getDisplayName = function (width, height) {
  return this.displayName;
}

fjs.hud.QueueMemberEntryModel.prototype.getExtension = function () {
  return this.extension;
}

fjs.hud.QueueMemberEntryModel.prototype.getAvatar = function (width, height) {
  if(this.contactId) {
    this.contact = this.dataManager.getModel('contacts').items[this.contactId];
    if(this.contact) {
      return this.contact.getAvatarUrl(width, height);
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
