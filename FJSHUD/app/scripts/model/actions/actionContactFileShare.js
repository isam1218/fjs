fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactShare = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "share", "ListRowActionButtonShare", "File share", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactShare, fjs.hud.ActionEntryModel);

/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactShare.prototype.makeAction = function(contact) {
    //location.hash = '/contact/'+contact.xpid;
    //this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, timestamp:Date.now()});
    alert('not implemented yet');
};


fjs.hud.ActionContactShare.prototype.pass = function(contact) {
    return !contact.isExternal();
};