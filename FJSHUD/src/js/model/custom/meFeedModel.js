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
/**
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
fjs.hud.MeFeedModel.prototype.getMyAvatarUrl = function(width, height) {
    var myPid = this.getMyPid();
    if(myPid) {
        return fjs.fdp.CONFIG.SERVER.serverURL+"/v1/contact_image?pid="+myPid+"&w="+width+"&h="+height+"&Authorization=" + this.fdp.ticket+"&node="+this.fdp.node;
    }
    else {
        return "img/Generic-Avatar-Small.png";
    }
};
/**
 * @returns {string=}
 */
fjs.hud.MeFeedModel.prototype.getMyPid = function() {
    var entry = this.itemsByKey["my_pid"];
    return entry && entry.propertyValue;
};
/**
 * @returns {boolean}
 */
fjs.hud.MeFeedModel.prototype.isMyPid = function(pid) {
    return this.getMyPid() == pid;
};
/**
 * @returns {string=}
 */
fjs.hud.MeFeedModel.prototype.getMyServerId = function() {
    var entry = this.itemsByKey["server_id"];
    return entry && entry.propertyValue;
};
/**
 * @returns {boolean}
 */
fjs.hud.MeFeedModel.prototype.isMyServerId = function(pid) {
    return this.getMyServerId() == pid;
};
/**
 * @returns {string}
 */
fjs.hud.MeFeedModel.prototype.getMyChatStatus = function() {
    var entry = this.itemsByKey["chat_status"];
   return entry && entry.propertyValue;
};

/**
 * @returns {string}
 */
fjs.hud.MeFeedModel.prototype.getMyAgentStatus = function() {
    var entry = this.itemsByKey["queue_agent_status"];
    return entry && entry.propertyValue;
};
/**
 * @returns {number=}
 */
fjs.hud.MeFeedModel.prototype.getMyAgentStatusDetails = function() {
    var entry = this.itemsByKey["queue_list_login"];
    return entry && entry.propertyValue.split(",").length;
};





