namespace("fjs.hud");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 * @extends fjs.fdp.GroupEntryModelBase
 * @param groupFeed {fjs.hud.GroupsFeedModel}
 */
fjs.hud.GroupEntryModel = function(obj, groupFeed) {
    fjs.hud.EntryModel.call(this, obj);
    this.memberIds = [];
    /**
     * @type {GroupFeedModel}
     */
    this.groupFeed = groupFeed;
    /**
     * @type {DataManager}
     */
    this.dataManager = new fjs.hud.DataManager();
    this.groupContactsModel = this.dataManager.getModel("groupcontacts");
    this.contactsModel = this.dataManager.getModel("contacts");
    /**
     *
     * @type {MeFeedModel}
     */
    this.meModel = this.dataManager.getModel("me");
};
fjs.hud.GroupEntryModel.extend(fjs.hud.EntryModel);

fjs.hud.GroupEntryModel.prototype.isEmpty = function() {
    return this.memberIds.length==0;
};
fjs.hud.GroupEntryModel.prototype.isMyServer = function() {
    return this.dataManager.getModel("me").isMyServerId(this["serverNumber"]);
};
fjs.hud.GroupEntryModel.prototype.getServerName = function() {
    //TODO: get from server feed
    var serverEntry = this.dataManager.getModel("server").getEntry(this["serverNumber"]);
    if(serverEntry && serverEntry["name"]){
        return serverEntry["name"];
    }
    //final ServerEntryModel server = this.getServerNumber();
    //return server != null ? server.name : this.serverNumber;
    //TODO: parse and return pid of xpid
    return this["serverNumber"];
};
fjs.hud.GroupEntryModel.prototype.isEditEnabled = function() {
    return ((this["permissions"]||0) & (1 << 2)) == 0;
};
fjs.hud.GroupEntryModel.prototype.isViewEnabled = function() {
    return this["isMeJoined"]||(((this["permissions"]||0) & (1 << 1)) == 0);
};
fjs.hud.GroupEntryModel.prototype.isJoinEnabled = function() {
    return ((this["permissions"]||0) & (1 << 2)) == 0;
};
fjs.hud.GroupEntryModel.prototype.isJoinMeEnabled = function() {
    return ((this["permissions"]||0) & (1 << 2)) == 0;
};
fjs.hud.ConferenceEntryModel.prototype.joinMe = function() {
    this.conferenceFeed.actionJoinMe(this.xpid);
};
fjs.hud.GroupEntryModel.prototype.addMember = function(memberId){
    if(this.memberIds.indexOf(memberId) == -1){
        this.memberIds.push(memberId);
    }
};
fjs.hud.GroupEntryModel.prototype.deleteMember = function(memberId){
    var index = this.memberIds.indexOf(memberId);
    if(index != -1){
        this.memberIds.splice(index);
    }
};
/**
 *
 * @returns {Number}
 */
fjs.hud.GroupEntryModel.prototype.getMembersCount = function(){
    return this.memberIds.length;
};
/**
 *
 * @param index {Number}
 * @param width {Number}
 * @param height {Number}
 * @returns {String}
 */
fjs.hud.GroupEntryModel.prototype.getAvatar = function(index, width, height) {
    if(this.memberIds.length > index){
        var /**@type {fjs.hud.ContactEntryModel}*/ contact = this.contactsModel.getEntry(this.memberIds[index]);
        return contact ? contact.getAvatarUrl(width, height) : "img/Generic-Avatar-Small.png";
    }
    return "img/Generic-Avatar-Small.png";
};
/**
 * @returns {boolean}
 */
fjs.hud.GroupEntryModel.prototype.pass = function(query){
    if(!query){
        return true;
    }
    var re = new RegExp('(^|\\s)(' + query + ')(\\S)*(\\s|$)', 'i');
    var res =  re.test(this["name"])||re.test(this["description"]);
    if(res){
        return true;
    }
//    for(var i = 0; i<this.memberIds.length; i++){
//        var contact = this.contactsModel.getEntry(this.memberIds[i]);
//        if(contact && contact.pass(query)){
//            return true;
//        }
//    }
    return false;
};
fjs.hud.GroupEntryModel.prototype.hasContact = function(contactId){
    return this.memberIds.indexOf(contactId) != -1;
};
fjs.hud.GroupEntryModel.prototype.hasMe = function(){
    return this.memberIds.indexOf(this.meModel.getMyPid()) != -1;
};
fjs.hud.GroupEntryModel.prototype.isChatEnabled = function(){
    return this.hasMe();
};
fjs.hud.GroupEntryModel.prototype.getChatStatus = function(){
    return this.isChatEnabled()?'Available':'Offline';
};
/**
 *
 * @returns {boolean}
 */
fjs.hud.GroupEntryModel.prototype.isDepartment = function(){
    return this.type == 0;
};
/**
 *
 * @returns {boolean}
 */
fjs.hud.GroupEntryModel.prototype.isFavorite = function(){
    return this.groupFeed.favoriteGroupXpid == this.xpid;
};
/**
 *
 * @returns {string}
 */
fjs.hud.GroupEntryModel.prototype.getOwnerName = function(){
    if(this.ownerId.favoriteGroupXpid == this.meModel.getMyPid()){
        return 'Me';
    }
    var _owner = this.contactsModel.getEntry(this.ownerId);
    return _owner? _owner.displayName : 'unknown';

};
