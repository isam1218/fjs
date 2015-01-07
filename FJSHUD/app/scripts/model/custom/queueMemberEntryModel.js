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




