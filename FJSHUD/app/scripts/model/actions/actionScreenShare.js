fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactScreenshare = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "screenshare", "ListRowActionButtonScreenShare", "Screenshare", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactScreenshare, fjs.hud.ActionEntryModel);

/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactScreenshare.prototype.makeAction = function(contact) {
    //location.hash = '/contact/'+contact.xpid;
    //this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, timestamp:Date.now()});
};


fjs.hud.ActionContactScreenshare.prototype.pass = function(contact) {
    return true;
};