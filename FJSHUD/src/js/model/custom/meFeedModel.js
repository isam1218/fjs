namespace("fjs.hud");
/**
* @param {fjs.hud.FDPDataManager} dataManager
* @constructor
*@extends fjs.hud.FeedModel
*/
fjs.hud.MeFeedModel = function(dataManager) {
    fjs.hud.FeedModel.call(this, "me", dataManager);
    this.itemsByKey = {};
};
fjs.hud.MeFeedModel.extend(fjs.hud.FeedModel);

fjs.hud.MeFeedModel.prototype.onEntryDeletion = function(data) {
    /**
     * @type {{propertyKey:string, propertyValue:string}}
     */
    var item = this.items[data.xpid];
    delete this.itemsByKey[item.propertyKey];
    delete this.items[data.xpid];
    this.fireEvent("delete", data);
};

fjs.hud.MeFeedModel.prototype.onEntryChange = function(data) {
    var item = this.items[data.xpid];
    if(!item) {
        item = this.items[data.xpid] = new fjs.hud.EntryModel(data.entry);
        this.itemsByKey[data.entry.propertyKey] = item;
        this.order.push(item);
    }
    else {
        item.fill(data.entry);
    }
    data.entry = item;
    this.fireEvent("push", data);
};

fjs.hud.MeFeedModel.prototype.getMyAvatarUrl = function(width, height) {
    var myPid = this.getMyPid();
    if(myPid) {
        return fjs.fdp.CONFIG.SERVER.serverURL+"/v1/contact_image?pid="+myPid+"&w="+width+"&h="+height+"&Authorization=" + this.fdp.ticket+"&node="+this.fdp.node;
    }
    else {
        return "img/Generic-Avatar-Small.png";
    }
};

fjs.hud.MeFeedModel.prototype.getMyPid = function() {
    return this.itemsByKey["my_pid"] && this.itemsByKey["my_pid"].propertyValue;
};


