fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactCallIntercom = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "intercom", "ListRowActionButtonIntercom", "Call intercom", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactCallIntercom, fjs.hud.ActionEntryModel);

/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactCallIntercom.prototype.makeAction = function(contact) {
    //location.hash = '/contact/'+contact.xpid;
    //this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, timestamp:Date.now()});
};


fjs.hud.ActionContactCallIntercom.prototype.pass = function(contact) {
    return !contact.isExternal();
};