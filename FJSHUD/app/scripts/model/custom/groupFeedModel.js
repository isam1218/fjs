fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.GroupsFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "groups", dataManager);
    this.groupContactsModel = dataManager.getModel("groupcontacts");
    var context = this;
    this.favoriteGroupXpid = '400000000_1';

    this.groupContactsModel.addEventListener("push", function(data){
        context.pushGroupContact(data);
    });
    this.groupContactsModel.addEventListener("delete", function(data){
        context.deleteGroupContact(data);
    });
};

fjs.core.inherits(fjs.hud.GroupsFeedModel, fjs.hud.FeedModel);

fjs.hud.GroupsFeedModel.prototype.pushGroupContact = function(data) {
    var groupId = data.entry["groupId"];
    var group = this.items[groupId];
    if(group){
        group.addMember(data.entry["contactId"]);
    }
};
fjs.hud.GroupsFeedModel.prototype.deleteGroupContact = function(data) {
    //var conference = this.items[data.entry["conferenceId"]];//empty entry
    for(var groupId in this.items){
        if(this.items.hasOwnProperty(groupId)){
            this.items[groupId].deleteMember(data.entry["contactId"]);//TODO: need entry
        }
    }
};
fjs.hud.GroupsFeedModel.prototype.onEntryChange = function(data) {
    var isNew = !this.items[data["xpid"]];
    fjs.hud.GroupsFeedModel.super_.prototype.onEntryChange.call(this, data);
    if(isNew){
        var /** fjs.hud.GroupEntryModel*/ group = this.items[data["xpid"]];
        for(var contactGroupId in this.groupContactsModel.items){
            if(this.groupContactsModel.items.hasOwnProperty(contactGroupId) && (this.groupContactsModel.items[contactGroupId]["groupId"] == data["xpid"])){
                group.addMember(this.groupContactsModel.items[contactGroupId]["contactId"]);
            }
        }
    }
};
fjs.hud.GroupsFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.GroupEntryModel(obj, this);
};

