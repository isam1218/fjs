namespace("fjs.model");

fjs.model.EntryModel = function(obj) {
    this.xef001id = null;
    this.xef001iver = null;
    this.xpid = null;
    this.fill(obj);
};

fjs.model.EntryModel.prototype.fill = function(obj) {
    if(obj)
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                this[i] = obj[i];
            }
        }
};