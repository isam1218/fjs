fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactChat = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "chat", "ListRowActionButtonChat", "Chat", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactChat, fjs.hud.ActionEntryModel);

/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactChat.prototype.makeAction = function(contact) {
    location.hash = '/contact/'+contact.xpid;
    this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, timestamp:Date.now()});
};


fjs.hud.ActionContactChat.prototype.pass = function(contact) {
    return true;
};