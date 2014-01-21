namespace("fjs.fdp");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 */
fjs.hud.ContactEntryModel = function(obj) {

    fjs.hud.EntryModel.call(this, obj);
};
fjs.hud.ContactEntryModel.extend(fjs.hud.EntryModel);

fjs.hud.ContactEntryModel.prototype.isExternal = function() {
    return !this["primaryExtension"];
};
fjs.hud.ContactEntryModel.prototype.pass = function(query) {
    if(!query){
        return false;
    }
    var re = new RegExp('(^|\\s)(' + query + ')(\\S)*(\\s|$)', 'i');
    return re.test(this["primaryExtension"])||re.test(this["displayName"])||re.test(this["firstName"])||re.test(this["lastName"])||re.test(this["phoneMobile"])||re.test(this["phoneMobile"]);
};
fjs.hud.ContactEntryModel.prototype.getAvatarUrl = function(width, height) {
    if(this.hasImage) {
        var dm = new fjs.hud.FDPDataManager();
        return fjs.fdp.CONFIG.SERVER.serverURL+"/v1/contact_image?pid="+this.xpid+"&w="+width+"&h="+height+"&Authorization="+dm.ticket+"&node="+dm.node+"&v="+this.imageVersion;
    }
    else {
        switch(width) {
            case 14:
                return "img/Generic-Avatar-14.png";
            case 28:
                return "img/Generic-Avatar-28.png";
            default:
                return "img/Generic-Avatar-Small.png";
        }
    }
};

fjs.hud.ContactEntryModel.prototype.getCallAvatarUrl = function(width, height) {
    if(this.contactId) {
        var dm = new fjs.hud.FDPDataManager();
        var contact = dm.getModel('contacts').items[this.contactId];
        if(contact) {
            return contact.getCallAvatarUrl(width, height);
        }
    }
        switch(width) {
            case 14:
                return "img/Generic-Avatar-14.png";
            case 28:
                return "img/Generic-Avatar-28.png";
            default:
                return "img/Generic-Avatar-Small.png";
        }
};
fjs.hud.ContactEntryModel.prototype.getDisplayName = function() {
    return (this.isExternal() && !this.displayName)?this.jid:this.displayName;
};
fjs.hud.ContactEntryModel.prototype.getChatStatus = function() {
    switch(this.xmpp){
        case 'available':
        case 'freeForChat':
            return 'Available';
        case 'away':
        case 'xa':
            return 'Away';
        case 'dnd':
            return 'Busy';
        case 'offline':
        case 'invisible':
        default:
             return 'Offline';
    }
};
fjs.hud.ContactEntryModel.prototype.getQueueStatus = function() {
    switch(this.queueStatus){
        case 'login':
            return 'LoggedIn';
        case 'login-permanent':
            return 'LockedIn';
        case 'logout':
            return 'LoggedOut';
        case 'logout-permanent':
            return 'LockedOut';
        case 'disabled':
        default:
            return 'NotAgent';
    }
};
fjs.hud.ContactEntryModel.prototype.getQueueStatusTitle = function() {
    switch(this.getQueueStatus()){
        case 'LoggedIn':
            return 'Logged in';
        case 'LockedIn':
            return 'Locked in';
        case 'LockedOut':
            return 'Locked out';
        case 'LoggedOut':
            return 'Logged out' + ": " + this.queueStatusReason;
        default:
            return 'Not agent';
    }
};
fjs.hud.ContactEntryModel.prototype.getCustomXmppStatus = function() {
    return this.xmppCustom||this.xmpp||"offline";
}
fjs.hud.ContactEntryModel.prototype.getPhone = function() {
    return this.primaryExtension||this.phoneBusiness||this.phoneMobile;
}

fjs.hud.ContactEntryModel.prototype.getCallType = function() {
    if(this.type==null)
    {
        return "None";
    }
    switch(this.type)
    {
        case 5:
        case 11:
            return "External";
        case 3:
            return "Queue";
        default:
            return "Office";
    }
}



