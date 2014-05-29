namespace("fjs.model");
/**
 * @param {fjs.model.DataManager} dataManager
 * @constructor
 * @extends fjs.model.FeedModel
 */
fjs.model.MeModel = function(dataManager) {
    fjs.model.FeedModel.call(this, fjs.model.MeModel.NAME, dataManager);
    this.property2key = {};
    this.propertyKey2Xpid = {};
};

fjs.model.MeModel.extend(fjs.model.FeedModel);

fjs.model.MeModel.prototype.onEntryChange = function(data) {
    if(data.entry) {
        if (data.entry.propertyKey) {
            this.propertyKey2Xpid[data.xpid] = data.entry.propertyKey;
            this.property2key[data.entry.propertyKey] = data.entry;
        }
        else {
            this.property2key[this.propertyKey2Xpid[data.xpid]] = data.entry;
        }
        this.superClass.onEntryChange.call(this, data);
    }
    else {
        debugger;
    }
};

fjs.model.MeModel.prototype.onEntryDeletion = function(data) {
    var key = this.propertyKey2Xpid[data.xpid];
    delete this.propertyKey2Xpid[data.xpid];
    var entry = this.property2key[key];
    if(entry.xpid == data.xpid) {
        delete this.property2key[key];
    }
    this.superClass.onEntryDeletion.call(this, data);
};

fjs.model.MeModel.prototype.getProperty = function(key) {
    return this.property2key[key] && this.property2key[key].propertyValue;
};

fjs.model.MeModel.NAME = "me";