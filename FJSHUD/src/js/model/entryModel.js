namespace("fjs.hud");

fjs.hud.EntryModel = function(obj) {
    this.xef001id = null;
    this.xef001iver = null;
    this.xpid = null;
    this.fill(obj);
};

fjs.hud.EntryModel.prototype.fill = function(obj) {
    if(obj)
    for(var i in obj) {
        if(obj.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
};

fjs.hud.EntryModel.prototype.clear = function() {
    for(var i in this) {
        if(this.hasOwnProperty(i) && !(this[i] instanceof fjs.fdp.EntryModel)) {
            this[i] = null;
        }
    }
};