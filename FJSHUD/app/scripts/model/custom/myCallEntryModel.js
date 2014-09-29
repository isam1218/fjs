fjs.hud.MyCallEntryModel = function(obj) {
    fjs.hud.EntryModel.call(this, obj, 'mycalls');
};
fjs.core.inherits(fjs.hud.MyCallEntryModel, fjs.hud.EntryModel);

fjs.hud.MyCallEntryModel.prototype.getCallType = function() {
    if(this.type == null) {
        return this.mycalldetails_queueId == null ? "Office" : "Queue";
    }
    switch(this.type) {
        case 5:
        case 11:
            return "External";
        case 0:
        case 1:
        case 2:
        case 4:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            return "Office";
        case 3:
            return "Queue";
        default:
            return "Office";
    }
};