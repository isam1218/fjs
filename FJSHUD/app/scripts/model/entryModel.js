fjs.core.namespace("fjs.hud");
/**
 *
 * @param obj
 * @constructor
 * @extends fjs.model.EntryModel
 */
fjs.hud.EntryModel = function(obj, feedName) {
    fjs.model.EntryModel.call(this, obj);
    this.feedName = feedName;
};
fjs.core.inherits(fjs.hud.EntryModel, fjs.model.EntryModel);


fjs.hud.EntryModel.prototype.clear = function() {
    var keys = Object.keys(this);
    for(var i=0; i <keys.length; i ++) {
        var key = keys[i];
        if(!(this[key] instanceof fjs.model.EntryModel) && key!='feedName') {
            this[key] = null;
        }
    }
};

fjs.hud.EntryModel.prototype.getSourceId = function() {
    if(this.xpid){
        var index = this.xpid.indexOf('_');
        if(index != -1){
            return this.xpid.substring(0, index);
        }
    }
};