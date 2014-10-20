fjs.core.namespace("fjs.hud");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 * @extends fjs.fdp.ContactEntryModelBase
 */
fjs.hud.CalllogEntryModel = function(obj) {

    fjs.hud.EntryModel.call(this, obj, 'calllog');
    this._phones = null;
};
fjs.core.inherits(fjs.hud.CalllogEntryModel, fjs.hud.EntryModel);

fjs.hud.CalllogEntryModel.prototype.getCallDuration = function() {
    var callduration = new Date(this.duration);
    var secs = callduration.getSeconds()+"";
    var minutes = callduration.getMinutes()+"";
    return (minutes.length == 1 ? '0'+minutes : minutes) + ':'
        + (secs.length == 1 ? '0'+secs : secs);

};

fjs.hud.CalllogEntryModel.prototype.getCalltime = function() {
    var date = new Date(this.startedAt);
    var time = date.toLocaleTimeString();

    if((Date.now()-this.startedAt)<86400000) {
        return 'Today, ' + time;
    }
    else if((Date.now()-this.startedAt)<(86400000*2)){
        return 'Yesterday, ' + time;
    }
    else {
        var monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month  = date.getMonth();
        return monthes[month] +" "+ date.getDay() + ', ' + time;
    }
};

fjs.hud.CalllogEntryModel.prototype.getPhoneNumber = function() {
    return this.phone;
};

fjs.hud.CalllogEntryModel.prototype.isExternal = function() {
    return !this.primaryExtension;
};

fjs.hud.CalllogEntryModel.prototype.hasCall = function() {
    return this.calls_xef001iver;
};

fjs.hud.CalllogEntryModel.prototype.pass = function(query) {
    if(!query){
        return false;
    }
    var re = new RegExp('(^|\\s)(' + query + ')(\\S)*(\\s|$)', 'i');
    return re.test(this["phone"])||re.test(this["displayName"])||re.test(this["duration"])||re.test(this["startedAt"])||re.test(this["type"]);
};
fjs.hud.CalllogEntryModel.prototype.getChatName = function() {
    var dm = new fjs.hud.DataManager();
    if(dm.getModel('me').getMyPid() == this.xpid) {
        return 'Me';
    }
    else {
        return this.getDisplayName();
    }
};
fjs.hud.CalllogEntryModel.prototype.getAvatarUrl = function(width, height) {
    if(this.fdpImage_xef001iver) {
        var dm = new fjs.hud.DataManager();
        return fjs.CONFIG.SERVER.serverURL+"/v1/contact_image?pid="+this.xpid+"&w="+width+"&h="+height+"&Authorization="+dm.api.ticket+"&node="+dm.api.node+"&v="+this.fdpImage_xef001iver;
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

fjs.hud.CalllogEntryModel.prototype.getCallAvatarUrl = function(width, height) {
    if(this.contactId) {
        var dm = new fjs.hud.DataManager();
        var contact = dm.getModel('contacts').items[this.contactId];
        if(contact) {
            return contact.getAvatarUrl(width, height);
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

fjs.hud.CalllogEntryModel.prototype.getCaller = function() {
    if(this.contactId) {
        var dm = new fjs.hud.DataManager();
        var contact = dm.getModel('calllog').items[this.contactId];
        if(contact) {
            return contact
        }
    }
};

fjs.hud.CalllogEntryModel.prototype.getPhones = function() {
    if(!this._phones) {
        this._phones = [];
        if(this.primaryExtension) {
            this._phones.push({number:this.primaryExtension, type:'primaryExtension', title:'extension'});
        }
        if(this.phoneMobile) {
            this._phones.push({number:this.phoneMobile, type:'phoneMobile', title:'mobile'});
        }
        if(this.phoneBusiness) {
            this._phones.push({number:this.phoneBusiness, type:'phoneBusiness', title:'buisness'});
        }
    }
    return this._phones;
};

fjs.hud.CalllogEntryModel.prototype.getActions = function(count) {
    console.time('getActions');
    if(!this.actions) {
        var dm = new fjs.hud.DataManager(), context = this;
        this.actions = dm.actionsManager.getActions(this);
    }
    if(!count) {
        console.timeEnd('getActions');
        return this.actions;
    }
    else {
        var _actions = this.actions.slice(0, count-1);
        console.timeEnd('getActions');
        return _actions;
    }
};

fjs.hud.CalllogEntryModel.prototype.getLocation = function() {
    return "Office";
};

fjs.hud.CalllogEntryModel.prototype.getDisplayName = function() {
    return (this.isExternal() && !this.displayName)?this.jid:this.displayName;
};
fjs.hud.CalllogEntryModel.prototype.getFoundDisplayName = function(query) {
    return this.getDisplayName().replace(new RegExp("("+query+")",'ig'), '<b>$1</b>');
};
fjs.hud.CalllogEntryModel.prototype.getFoundExtension = function(query) {
    return this.primaryExtension ? ('#' + this.primaryExtension.replace(new RegExp("("+query+")", 'ig'), '<b>$1</b>')) : "";
};

fjs.hud.CalllogEntryModel.prototype.getChatStatus = function() {
    switch(this.contactstatus_xmpp){
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
fjs.hud.CalllogEntryModel.prototype.getQueueStatus = function() {
    switch(this.contactstatus_queueStatus){
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
fjs.hud.CalllogEntryModel.prototype.getQueueStatusTitle = function() {
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
fjs.hud.CalllogEntryModel.prototype.getCustomXmppStatus = function() {
    return this.contactstatus_xmppCustom||this.contactstatus_xmpp||"offline";
};
fjs.hud.CalllogEntryModel.prototype.getPhone = function() {
    return this.primaryExtension||this.phoneBusiness||this.phoneMobile;
};

fjs.hud.CalllogEntryModel.prototype.getCallType = function() {
    if(this.type==null)
    {
        return "None";
    }
    switch(this.type)
    {
        case 5:
            return "Outbound";
        case 4:
            return "Incoming";
        default:
            return "None";
    }
};



