fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactCallExtension = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "callPrimaryExt", "ListRowActionButtonCall", "Call", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactCallExtension, fjs.hud.ActionEntryModel);
/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactCallExtension.prototype.makeAction = function(contact) {
    this.dataManager.sendAction(this.feedName, this.name, {'toContactId': contact.xpid});
    this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, message:"Outbound internal call", timestamp:Date.now()});
};
fjs.hud.ActionContactCallExtension.prototype.pass = function(entryModel) {
    return !!entryModel.primaryExtension;
};
