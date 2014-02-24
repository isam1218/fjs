namespace("fjs.fdp");

fjs.fdp.EntryModel = function(obj) {
    this.xef001id = null;
    this.xef001iver = null;
    this.xpid = null;
    this.fill(obj);
};

fjs.fdp.EntryModel.prototype.fill = function(obj) {
    var changes = {};
    if(obj) {
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                if(this[i]!=obj[i]) {
                    this[i] = obj[i];
                    changes[i] = this[i];
                }
            }
        }
    }
    return changes;
};