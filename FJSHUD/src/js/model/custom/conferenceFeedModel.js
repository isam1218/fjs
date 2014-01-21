namespace("fjs.hud");
/**
 * @param {fjs.hud.FDPDataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.ConferenceFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "conferences", dataManager);
    this.membersOrder = [];
    this.talkingMembersOrder = [];
    this.occupiedConferences = [];
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
    var conferenceId = data.entry["fdpConferenceId"];
    var conference = this.items[conferenceId];
    if(conference){
        conference.addMember(data["xpid"], data.entry);
    }
    if(this.membersOrder.indexOf(data["xpid"]) == -1){
        this.membersOrder.push(data["xpid"]);
    }
    var index;
    if(data.entry.muted){
        index = this.talkingMembersOrder.indexOf(data["xpid"]);
        if( index != -1){
            this.talkingMembersOrder.splice(index, 1);
        }
    }else{
        index = this.talkingMembersOrder.indexOf(data["xpid"]);
        if( index == -1){
            this.talkingMembersOrder.push(data["xpid"]);
        }
    }
    if(this.occupiedConferences.indexOf(conferenceId) == -1){
        this.occupiedConferences.push(conferenceId);
    }
};
fjs.hud.ConferenceFeedModel.prototype.deleteConferenceMember = function(data) {
    //var conference = this.items[data.entry["conferenceId"]];//empty entry
    for(var conferenceId in this.items){
        if(this.items.hasOwnProperty(conferenceId)){
            this.items[conferenceId].deleteMember(data["xpid"]);
            if(this.items[conferenceId].getMembersCount() == 0){
                var index = this.occupiedConferences.indexOf(conferenceId);
                if(index != -1){
                    this.occupiedConferences.splice(index, 1);
                }
            }
        }
    }
    index = this.membersOrder.indexOf(data["xpid"]);
    if( index != -1){
        this.membersOrder.splice(index, 1);
    }
    index = this.talkingMembersOrder.indexOf(data["xpid"]);
    if( index != -1){
        this.talkingMembersOrder.splice(index, 1);
    }

};
fjs.hud.ConferenceFeedModel.prototype.onEntryChange = function(data) {
    var isNew = !this.items[data["xpid"]];
    this.superClass.onEntryChange.call(this, data);
    if(isNew){
        var conference = this.items[data["xpid"]];
        for(var memberId in this.conferenceMembersModel.items){
            if(this.conferenceMembersModel.items.hasOwnProperty(memberId) && (this.conferenceMembersModel.items[memberId]["fdpConferenceId"] == data["xpid"])){
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
    for(var i=0; i<this.order.length; i++){
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
    for(var i=0; i< this.order.length; i++){
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