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

fjs.model.CallLogEntryModel.prototype.getCallSubject = function() {
    var subjectParts = [];
    var formatDate = function(date) {
        var d = date.getDate().toString(),
            m = (date.getMonth()+1).toString(),
            y = date.getFullYear().toString();
        d = d.length>1 ? d : "0"+d;
        m = m.length>1 ? m : "0"+m;
        return m+"/"+d+"/"+y;
    };
    var date = new Date(this.created);
    subjectParts.push(this.incoming ? "Inbound" : "Outbound");
    subjectParts.push("Call");
    subjectParts.push(formatDate(date));
    return subjectParts.join(" ");
};