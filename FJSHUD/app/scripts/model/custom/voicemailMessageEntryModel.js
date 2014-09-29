fjs.core.namespace("fjs.hud");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 * @extends fjs.fdp.VoicemailMessageEntryModelBase
 * @param voicemailFeed {VoicemailMessageFeedModel}
 */
fjs.hud.VoicemailMessageEntryModel = function(obj, voicemailFeed) {
    fjs.hud.EntryModel.call(this, obj, 'voicemailbox');
    /**
     * @type {VoicemailMessageFeedModel}
     */
    this.voicemailFeed = voicemailFeed;
    /**
     * @type {DataManager}
     */
    this.dataManager = new fjs.hud.DataManager();
};

fjs.core.inherits(fjs.hud.VoicemailMessageEntryModel, fjs.hud.EntryModel);

fjs.hud.VoicemailMessageEntryModel.prototype.markAsRead = function() {
    this.voicemailFeed.markAsRead(this.xpid);
};
/**
 *
 * @param width {Number}
 * @param height {Number}
 * @returns {String}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getAvatarUrl = function(width, height) {
    //TODO: group avatar for group, conference, queue call
    return this.getContact()?this.getContact().getAvatarUrl():"img/Generic-Avatar-Small.png";
};
/**
 * @returns {boolean}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.pass = function(query){
    if(!query){
        return true;
    }
    var re = new RegExp('(^|\\s)(' + query + ')(\\S)*(\\s|$)', 'i');
    var res =  re.test(this["roomNumber"])||re.test(this["extensionNumber"])||re.test(this["name"]);
    if(res){
        return true;
    }
    if(this.getContact() && this.getContact().pass(query)){
        return true;
    }
    //TODO: check queue, group, conference
    return false;
};
/**
 * @returns {ContactEntryModel}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getContact = function(){
    return this.dataManager.getModel("contacts").getEntryByXpid(this.contactId);
};
/**
 *
 * @returns {ConferenceEntryModel}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getConference = function(){
    return this.dataManager.getModel("conferences").getEntryByXpid(this.conferenceId);
};
fjs.hud.VoicemailMessageEntryModel.prototype.getGroup = function(){
    return this.dataManager.getModel("groups").getEntryByXpid(this.groupId);
};
fjs.hud.VoicemailMessageEntryModel.prototype.getQueue = function(){
    return this.dataManager.getModel("queues").getEntryByXpid(this.queueId);
};
/**
 *
 * @returns {string}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getCallStatus = function(){
    return this.contactId?"Office":"External";
};
/**
 *
 * @returns {string}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getTranscription = function(){
    if(true/*Api.Instance.getCustomMeModel().isVMTranscriptionEnabled()*/){
        return this.transcription||"transcription is not available";
    }
    return "transcription is not licensed";
};
/**
 *
 * @returns {string}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getTranscriptionStatus = function(){
    if(true/*Api.Instance.getCustomMeModel().isVMTranscriptionEnabled()*/){
        return this.transcription?'Available':'NotAvailable';
    }
    return 'NoLicense';
};
/**
 *
 * @returns {string}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getDate = function(){
    var date = new Date(this.date);
    if((Date.now()-this.date)<86400000) {
        return 'Today';
    }
    else if((Date.now()-this.date)<(86400000*2)){
        return 'Yesterday';
    }
    else {
        var monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month  = date.getMonth();
        return monthes[month] +" "+ date.getDay();
    }
};

/**
 *
 * @returns {string}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getDuration = function(){
    var duration = new Date(this.duration);
    var secs = duration.getSeconds()+"";
    var minutes = duration.getMinutes()+"";
    return (minutes.length == 1 ? '0'+minutes : minutes) + ':'
        + (secs.length == 1 ? '0'+secs : secs);
};
/**
 *
 * @returns {boolean}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.isFromMe = function(){
    return this.xpid && (this.xpid[0] == '4');
};
/**
 *
 * @returns {string}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getFormatedContactPhone = function(){
    var phone = this.getContact()?this.getContact().getPhone():this.phone;
    return ((phone == this.displayName)||!phone)?'':" <" + phone + ">";
};
/**
 *
 * @returns {string}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.getPhone = function(){
    return this.getContact()?this.getContact().getPhone():this.phone;
};
/**
 *
 * @returns {boolean}
 */
fjs.hud.VoicemailMessageEntryModel.prototype.hasPhone = function(){
    return !!this.getPhone();
};
fjs.hud.VoicemailMessageEntryModel.prototype.actionCallback = function(){
//    if(this.hasPhone()){
//        //Api.getInstance().getPhoneModel().actionCallTo(phone);
//    }
    this.voicemailFeed.actionCallback(this.xpid);
};


