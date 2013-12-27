namespace("fjs.fdp");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 */
fjs.hud.ConferenceEntryModel = function(obj, conferenceFeed) {
    fjs.hud.EntryModel.call(this, obj);
    this.members = [];
    /**
     *
     * @type {ConferenceFeedModel}
     */
    this.conferenceFeed = conferenceFeed
    /**
     *
     * @type {FDPDataManager}
     */
    this.dataManager = new fjs.hud.FDPDataManager();
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
fjs.hud.ConferenceEntryModel.prototype.addMember = function(memberId){
    if(this.members.indexOf(memberId) == -1){
        this.members.push(memberId);
    }
}
fjs.hud.ConferenceEntryModel.prototype.deleteMember = function(memberId){
    var index = this.members.indexOf(memberId);
    if(i != -1){
        this.members.splice(index);
    }
}



