namespace("fjs.hud");
/**
 * @param {fjs.hud.FDPDataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ConferenceFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "conferences", dataManager);
    this.membersOrder = [];
    this.conferenceMembersModel = dataManager.getModel("conferencemembers");
    context = this;
    this.conferenceMembersModel.addListener("push", function(data){
        context.pushConferenceMember(data);
    });
    this.conferenceMembersModel.addListener("delete", function(data){
        context.deleteConferenceMember(data);
    });
};
fjs.hud.ConferenceFeedModel.extend(fjs.hud.FeedModel);

fjs.hud.ConferenceFeedModel.prototype.pushConferenceMember = function(data) {
    var conference = this.items[data.entry["fdpConferenceId"]];
    if(conference){
        conference.addMember(data["xpid"], data.entry);
    }
    if(this.membersOrder.indexOf(data["xpid"]) == -1){
        this.membersOrder.push(data["xpid"]);
    }

};
fjs.hud.ConferenceFeedModel.prototype.deleteConferenceMember = function(data) {
    //var conference = this.items[data.entry["conferenceId"]];//empty entry
    for(var conferenceId in this.items){
        this.items[conferenceId].deleteMember(data["xpid"]);
    }
    var index = this.membersOrder.indexOf(data["xpid"]);
    if( index != -1){
        delete this.membersOrder.splice(index, 1);
    }
};
fjs.hud.ConferenceFeedModel.prototype.onEntryChange = function(data) {
    var isNew = !this.items[data["xpid"]];
    this.superClass.onEntryChange.call(this, data);
    if(isNew){
        var conference = this.items[data["xpid"]];
        for(var memberId in this.conferenceMembersModel.items){
            if(this.conferenceMembersModel.items[memberId]["fdpConferenceId"] == data["xpid"]){
                conference.addMember(memberId, data.entry);
            }
        }
    }
};
fjs.hud.ConferenceFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.ConferenceEntryModel(obj, this);
};
fjs.hud.ConferenceFeedModel.prototype.actionJoinMe = function(confId) {
    this.actionJoinContact(confId, this.fdp.getModel("me").getMyPid());
};
fjs.hud.ConferenceFeedModel.prototype.actionJoinContact = function(confId, contactId) {
    this.fdp.sendAction("conferences", "joinContact", {"a.conferenceId":confId, "a.contactId":contactId});
};
fjs.hud.ConferenceFeedModel.prototype.getFreeConferenceRoomToJoin = function() {
    var candidate = undefined;
    for(var i in this.order){
        var conference = this.order[i];
        if(conference.isEmpty() && conference.isViewEnabled()){
            if(!candidate){
                candidate = conference;
            }else{
                if(this.compareFreeConferences(conference, candidate)<0){
                    candidate = conference;
                }
            }
        }
    }
    return candidate;
};
fjs.hud.ConferenceFeedModel.prototype.compareFreeConferences = function(conf1, conf2) {
    if(conf1.isEditEnabled()!= conf2.isEditEnabled()){
        return conf1.isEditEnabled()?-1:1;
    }
    if(conf1.isMyServer()!= conf2.isMyServer()){
        return conf1.isEditEnabled()?-1:1;
    }
    //TODO: compare by serverName
    return conf1["roomNumber"] - conf2["roomNumber"];
};

fjs.hud.ConferenceFeedModel.prototype.getMyFreeConferenceRoomToJoin = function() {
    var candidate = undefined;
    for(var i in this.order){
        var conference = this.order[i];
        if(conference.isEmpty() && conference.isEditEnabled()){
            if(!candidate){
                candidate = conference;
            }else{
                if(this.compareFreeConferences(conference, candidate)<0){
                    candidate = conference;
                }
            }
        }
    }
};

//public ConferenceEntryModel getFreeConferenceRoomToJoin()
//{
//    final SortedMap<ConferenceEntryModel> myConf = new SortedMap<ConferenceEntryModel>(this);
//    final SortedMap<ConferenceEntryModel> otherConf = new SortedMap<ConferenceEntryModel>(this);
//    this.conferencesModel.getEntries().accept(new Function2<String, ConferenceEntryModel, Boolean>()
//    {
//
//        @Override
//        public Boolean $execute(final String xpid, final ConferenceEntryModel entry)
//        {
//            if(entry.isEmpty() && entry.isActionEnabled("join_me") && entry.isActionEnabled("join"))
//            {
//                myConf.set(xpid, entry);
//
//            }
//            else if(!entry.getPermissions().isEditConfEnabled() && entry.isEmpty()
//                && isView)
//            {
//                otherConf.set(xpid, entry);
//            }
//            return true;
//        }
//    });
//    return myConf.size() == 0 ? (0 == otherConf.size() ? null : otherConf.sortedValues.$get(0).value)
//        : myConf.sortedValues.$get(0).value;
//}