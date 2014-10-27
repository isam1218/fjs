fjs.core.namespace('fjs.hud');

fjs.hud.ActionContactUnpin = function(dataManager) {
    fjs.hud.ActionEntryModel.call(this, "unpin", "ListRowActionButtonUnpin", "Unpin", "contacts", dataManager);
};
fjs.core.inherits(fjs.hud.ActionContactUnpin, fjs.hud.ActionEntryModel);

/**
 * @param {fjs.hud.ContactEntryModel} contact
 */
fjs.hud.ActionContactUnpin.prototype.makeAction = function(contact) {
	/*
    var extensionObject = document.getElementById("extensionObject");
    var sendMessage = function(message) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent("FonExtensionEvent", true, true, message);
        this.extensionObject.dispatchEvent(event);
    };
    sendMessage({"action":"runApp", "url":"contact/"+contact.xpid});
	*/
	
	window.open('popup.html#/contact/' + contact.xpid, contact.xpid, "scrollbars=yes, status=no, titlebar=no, toolbar=no, location=no, menubar=no, width=500, height=600");
};


fjs.hud.ActionContactUnpin.prototype.pass = function(contact) {
    return true;
};