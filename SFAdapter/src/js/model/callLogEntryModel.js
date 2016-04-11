fjs.model.CallLogEntryModel = function(obj) {
    fjs.model.EntryModel.call(this, obj);
};
fjs.model.CallLogEntryModel.extend(fjs.model.EntryModel);

fjs.model.CallLogEntryModel.prototype.fill = function(obj, scope) {
    scope = scope || this;
    if(obj)
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                var field = obj[i];
                if(typeof(field)!='object' || field==null) {
                    if(i!='note' || !this._blockChangeNote) {
                        scope[i] = field;
                    }
                }
                else if(Array.isArray(field)) {
                    scope[i] = [];
                    this.fill(field, scope[i]);
                }
                else  {
                    if(!scope[i]) {
                        scope[i] = {};
                    }
                    this.fill(field, scope[i]);
                }
            }
        }
};