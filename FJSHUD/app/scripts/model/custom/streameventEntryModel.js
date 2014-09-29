fjs.core.namespace("fjs.hud");


fjs.hud.StreamEventEntryModel = function(obj, dataManager) {
    fjs.hud.EntryModel.call(this, obj, 'streamevent');
    this.dataManager = dataManager;

};
fjs.core.inherits(fjs.hud.StreamEventEntryModel, fjs.hud.EntryModel);

fjs.hud.StreamEventEntryModel.prototype.getFrom = function() {
    var _from = this.from.split(':');
    if(_from[0]=='contacts') {
        return this.dataManager.getModel('contacts').getEntryByXpid(_from[1]);
    }
};

fjs.hud.StreamEventEntryModel.prototype.getTime = function() {
    var date = new Date(this.created);
    return date.getHours()+ ":" + date.getMinutes();
};

fjs.hud.StreamEventEntryModel.prototype.getDate = function() {
    var date = new Date(this.created);
    if((Date.now()-this.created)<86400000) {
        return 'Today';
    }
    else if((Date.now()-this.created)<(86400000*2)){
        return 'Yesterday';
    }
    else {
        var monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month  = date.getMonth();
        return monthes[month] +" "+ date.getDay();
    }
};

