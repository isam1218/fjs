fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactCallVoicemail = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "voicemail", "ListRowActionButtonVoicemail", "Voicemail", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactCallVoicemail, fjs.hud.ActionEntryModel);

/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactCallVoicemail.prototype.makeAction = function(contact) {
    //location.hash = '/contact/'+contact.xpid;
    //this.dataManager.sendAction("widget_history", "push", {xpid:'contact_'+contact.xpid, key:'contact/'+contact.xpid, timestamp:Date.now()});
};


fjs.hud.ActionContactCallVoicemail.prototype.pass = function(contact) {
    return !contact.isExternal();
};