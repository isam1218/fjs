namespace("fjs.fdp");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 * @param conferenceFeed {fjs.hud.ConferenceFeedModel}
 */
fjs.hud.ConferenceEntryModel = function(obj, conferenceFeed) {
    fjs.hud.EntryModel.call(this, obj);
    this.members = [];
    this.memberIds = [];
    /**
     * @type {fjs.hud.ConferenceFeedModel}
     */
    this.conferenceFeed = conferenceFeed;
    /**
     * @type {fjs.hud.DataManager}
     */
    this.dataManager = new fjs.hud.DataManager();
    this.conferenceMembersModel = this.dataManager.getModel("conferencemembers");
};
fjs.hud.ConferenceEntryModel.extend(fjs.hud.EntryModel);

fjs.hud.ConferenceEntryModel.prototype.isEmpty = function() {
    return this.members.length==0;
};
fjs.hud.ConferenceEntryModel.prototype.isMyServer = function() {
    return this.dataManager.getModel("me").isMyServerId(this["serverNumber"]);
};
fjs.hud.ConferenceEntryModel.prototype.getServerName = function() {
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
fjs.hud.ConferenceEntryModel.prototype.isEditEnabled = function() {
    return ((this["permissions"]||0) & (1 << 2)) == 0;
};
fjs.hud.ConferenceEntryModel.prototype.isViewEnabled = function() {
    return this["isMeJoined"]||(((this["permissions"]||0) & (1 << 1)) == 0);
};
fjs.hud.ConferenceEntryModel.prototype.isJoinEnabled = function() {
    return ((this["permissions"]||0) & (1 << 2)) == 0;
};
fjs.hud.ConferenceEntryModel.prototype.isJoinMeEnabled = function() {
    return ((this["permissions"]||0) & (1 << 2)) == 0;
};
fjs.hud.ConferenceEntryModel.prototype.joinMe = function() {
    this.conferenceFeed.actionJoinMe(this.xpid);
};
fjs.hud.ConferenceEntryModel.prototype.addMember = function(memberId, member){
    if(this.memberIds.indexOf(memberId) == -1){
        this.memberIds.push(memberId);
        this.members.push(member);
    }
};
fjs.hud.ConferenceEntryModel.prototype.deleteMember = function(memberId){
    var index = this.memberIds.indexOf(memberId);
    if(index != -1){
        this.memberIds.splice(index);
        this.members.splice(index);
    }
};
/**
 *
 * @returns {Number}
 */
fjs.hud.ConferenceEntryModel.prototype.getMembersCount = function(){
    return this.members.length;
};
/**
 *
 * @param index {Number}
 * @param width {Number}
 * @param height {Number}
 * @returns {String}
 */
fjs.hud.ConferenceEntryModel.prototype.getAvatar = function(index, width, height) {
    if(this.members.length > index){
        return this.members[index].getAvatarUrl(width, height);
    }
    return "img/Generic-Avatar-Small.png";
};
/**
 *
 * @param other {ConferenceEntryModel}
 * @returns {number}
 */
fjs.hud.ConferenceEntryModel.prototype.compareTo = function(other){
    if(this.serverNumber == other.serverNumber)
    {
        return this.roomNumber - other.roomNumber;
    }
    else
    {
        var diff = (this.isMyServer() ? 0 : 1) - (other.isMyServer() ? 0 : 1);
        if(diff)
        {
            return diff;
        }
        return this.getServerName().localeCompare(other.getServerName());
    }
};
/**
 * @returns {boolean}
 */
fjs.hud.ConferenceEntryModel.prototype.pass = function(query){
    if(!query){
        return true;
    }
    var re = new RegExp('(^|\\s)(' + query + ')(\\S)*(\\s|$)', 'i');
    var res =  re.test(this["roomNumber"])||re.test(this["extensionNumber"])||re.test(this["name"]);
    if(res){
        return true;
    }
    for(var i = 0; i<this.members.length; i++){
        var contact = this.members[i].getContact();
        if(contact && contact.pass(query)){
            return true;
        }
    }
    return false;
};



