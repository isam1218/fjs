fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactEmail = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "email", "ListRowActionButtonEmail", "Email", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactEmail, fjs.hud.ActionEntryModel);

/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactEmail.prototype.makeAction = function(contact) {
    window.open('mailto://'+contact.email);
    this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, message:"Outgoing email", timestamp:Date.now()});
};


fjs.hud.ActionContactEmail.prototype.pass = function(contact) {
    return !!contact.email;
};