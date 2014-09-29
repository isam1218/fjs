fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactCallMobile = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "callMobile", "ListRowActionButtonMobile", "Call mobile", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactCallMobile, fjs.hud.ActionEntryModel);
/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactCallMobile.prototype.makeAction = function(contact) {
    this.dataManager.sendAction(this.feedName, this.name, {'toContactId': contact.xpid});
    this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, message:"Mobile call", timestamp:Date.now()});
};
fjs.hud.ActionContactCallMobile.prototype.pass = function(contact) {
    return !!contact.phoneMobile;
};
