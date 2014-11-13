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
    var dm = this.dataManager;

    return fjs.CONFIG.SERVER.serverURL+"/v1/contact_image?pid="+xpid+"&w="+width+"&h="+height+"&Authorization=" + dm.api.ticket+"&node=" + dm.api.node;

//    return fjs.CONFIG.SERVER.serverURL + "/v1/contact_image?pid=" + xpid + "&w=" + width + "&h=" + height + "&Authorization=" + dm.api.ticket + "&node=" + dm.api.node + "&v=" + this.fdpImage_xef001iver;
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
