fjs.core.namespace("fjs.hud");

/**
 * @param {string} feedName
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 * @extends fjs.model.FeedModel
 */
fjs.hud.FeedModel = function(feedName, dataManager) {
    var context = this;
    fjs.model.FeedModel.call(this, feedName);
    /**
     *
     * @type {fjs.hud.DataManager}
     */
    this.dataManager = dataManager;

    this.dataManager.addEventListener(this.feedName, function(data){
        context.onSyncStart({feed:data["feed"], eventType:"start"});
        var changes = data["changes"];
        var keys = Object.keys(changes);
        for(var i=0; i<keys.length; i++) {
            var key = keys[i];
            if(changes[key].type=="change") {
                context.onEntryChange(changes[key]);
            }
            else if(changes[key].type=="delete") {
                context.onEntryDeletion(changes[key]);
            }
        }
        context.onSyncComplete({feed:data["feed"], eventType:"complete"});
    });
};

fjs.core.inherits(fjs.hud.FeedModel, fjs.model.FeedModel);

fjs.hud.FeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.EntryModel(obj, this.feedName);
};