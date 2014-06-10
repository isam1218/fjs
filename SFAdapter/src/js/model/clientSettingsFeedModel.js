namespace('fjs.model');

fjs.model.ClientSettingsFeedModel = function(dataManager) {
    fjs.model.FeedModel.call(this, "clientsettings", dataManager);
};
fjs.model.ClientSettingsFeedModel.extend(fjs.model.FeedModel);
fjs.model.ClientSettingsFeedModel.prototype.savePhone = function(phone, calleeInfo) {
    if(this.items['phoneMap']) {
        this.items['phoneMap'].phones[phone] = calleeInfo;
        this.dataManager.sendAction("clientsettings", "push", this.items["phoneMap"]);
    }
    else {
        var phoneMapObj = {xpid: 'phoneMap', phones:{}};
        phoneMapObj.phones[phone] = calleeInfo;
        this.dataManager.sendAction("clientsettings", "push", phoneMapObj);
    }
};

fjs.model.ClientSettingsFeedModel.prototype.deletePhone = function(phone) {
    if(this.items['phoneMap']) {
        delete this.items['phoneMap'].phones[phone];
        this.dataManager.sendAction("clientsettings", "push", this.items["phoneMap"]);
    }
};
