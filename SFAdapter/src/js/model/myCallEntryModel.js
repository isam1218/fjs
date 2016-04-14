namespace("fjs.model");

fjs.model.MyCallEntryModel = function(obj) {
    var context = this;

    function getCurrentDate() {
        var d = new Date(context.created);
        return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    }
    
    this.mycallsclient_callLog = {
        'date': getCurrentDate(),
        'subject': this.getCallSubject(),
        'xpid':this.xpid,
        'note': '',
        'callType': (this.incoming ? "inbound" : "outbound"),
        'isOpened':true,
        'tranferOpened':false,
        'whatId':null,
        'whoId':null,
        'related': []
    };
    
    fjs.model.EntryModel.call(this, obj);
};



fjs.model.MyCallEntryModel.extend(fjs.model.EntryModel);

fjs.model.MyCallEntryModel.prototype.getCallSubject = function() {
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

fjs.model.MyCallEntryModel.prototype.getFormattedPhone = function() {
    if(this.phone) {
        var rawPhone = this.phone.replace(/[^0-9]/g, '');
        if (rawPhone.length > 10) {
            rawPhone = rawPhone.slice(rawPhone.length - 10, rawPhone.length);
        }
        var formattedPhone = null;
        if (rawPhone.length > 4) {
            formattedPhone = rawPhone.split("").reverse().join("");
            if (formattedPhone.length > 7 && formattedPhone.length <= 10) {
                formattedPhone = formattedPhone.replace(/(\d{4})(\d{3})(\d{3}|\d{2}|\d{1})/, "$1-$2-$3");
            }
            if (formattedPhone.length > 4 && formattedPhone.length <= 7) {
                formattedPhone = formattedPhone.replace(/(\d{4})(\d{3}|\d{2}|\d{1})/, "$1-$2");
            }
            formattedPhone = formattedPhone.split("").reverse().join("");
        }
        if (formattedPhone) {
            rawPhone += ' or ' + formattedPhone;
        }
        return rawPhone;
    }
    return null;
};

fjs.model.MyCallEntryModel.HOLD_CALL_TYPE = 3;
fjs.model.MyCallEntryModel.RING_CALL_TYPE = 0;

fjs.model.MyCallEntryModel.prototype.onHold = function() {
    return this.state == fjs.model.MyCallEntryModel.HOLD_CALL_TYPE;
};

fjs.model.MyCallEntryModel.prototype.isRing = function() {
    return this.state == fjs.model.MyCallEntryModel.RING_CALL_TYPE;
};

fjs.model.MyCallEntryModel.prototype.getWho = function(notLead) {

    for(var i=0;i<this.mycallsclient_callLog.related.length; i++) {
        var item = this.mycallsclient_callLog.related[i];
        if(this.getRelatedItemType(item)=='who' && (!notLead || item.object!='Lead')) return item;
    }
};

fjs.model.MyCallEntryModel.prototype.getWhat = function() {
    for(var i=0;i<this.mycallsclient_callLog.related.length; i++) {
        var item = this.mycallsclient_callLog.related[i];
        if(this.getRelatedItemType(item)=='what') return item;
    }
};

fjs.model.MyCallEntryModel.prototype.findCallLogTargetById = function(id) {
        for (var i = 0; i < this.mycallsclient_callLog.related.length; i++) {
            var item = this.mycallsclient_callLog.related[i];
            if (item._id == id) {
                return item;
            }
        }
};

fjs.model.MyCallEntryModel.prototype.getRelatedItemType = function(item) {
    return item.object == 'Contact' || item.object == 'Lead' ? 'who' : 'what';
};

fjs.model.MyCallEntryModel.prototype.fillCallLogData = function(data, clientSettingsModel) {

    var _whatId = this.mycallsclient_callLog.whatId,
        _whoId = this.mycallsclient_callLog.whoId,
        _changed = false;

   if(!this.mycallsclient_callLog._notNew) {
       this.mycallsclient_callLog._notNew = _changed = true;
   }

    if(this.pidChanged) {
        _changed = true;
        this.pidChanged = false;
    }

    var phoneMap = clientSettingsModel.items['phoneMap'] && clientSettingsModel.items['phoneMap'].phones || {};


    if(data && data.result) {
        var result = fjs.utils.JSON.parse(data.result);
        for(var i in result) {
            if (result.hasOwnProperty(i) && i != "screenPopUrl" && result[i].object != 'CaseComment') {
                var _result = result[i];
                _result._id = i;
                if(_result.object == "Case") {
                    _result.Name = _result["CaseNumber"];
                }
                var item = this.findCallLogTargetById(i);
                if (!item) {
                    item = _result;
                    this.mycallsclient_callLog.related.push(item);
                    _changed = true;
                }
                else if (item.Name != _result.Name) {
                    item.Name = _result.Name;
                    _changed = true;
                }
                item.new = true;
            }
        }
    }
        var _items = this.mycallsclient_callLog.related.slice(0);
        for(var i=0; i<_items.length; i++) {
            var _item = _items[i];
            if(_item.new) {
                _item.new = false;
            }
            else {
                var index = this.mycallsclient_callLog.related.indexOf(_item);
                if(index>-1) {
                    this.mycallsclient_callLog.related.splice(index, 1);
                    if(this.mycallsclient_callLog.pervWhatId == _item._id) {
                        this.mycallsclient_callLog.pervWhatId = null;
                    }
                    _changed = true;
                }
            }
        }


    fjs.model.filter.SortRelatedFields()(this.mycallsclient_callLog.related);

    var calleeInfo = phoneMap[this.phone], item;
    if(calleeInfo && (item = this.findCallLogTargetById(calleeInfo.id))) {
            if(this.getRelatedItemType(item) == 'who') {
                this.mycallsclient_callLog.whoId = calleeInfo.id;

                if(item.object == 'Lead') {
                    this.mycallsclient_callLog.whatId = null;
                }
            }
            else {
                var who = this.getWho(true);
                this.mycallsclient_callLog.whoId =  who && who._id;
                this.mycallsclient_callLog.whatId = calleeInfo.id;
            }
    }
    else {
        var who = this.findCallLogTargetById(this.mycallsclient_callLog.whoId);
        if(!who) {
            who = this.getWho();
            this.mycallsclient_callLog.whoId = who && who._id;
        }
    }
    if(calleeInfo) {
        clientSettingsModel.deletePhone(this.phone);
    }
    return _changed || _whatId!=this.mycallsclient_callLog.whatId || _whoId != this.mycallsclient_callLog.whoId;
};

fjs.model.MyCallEntryModel.prototype.fill = function(obj, scope) {
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

fjs.model.MyCallEntryModel.prototype.showRelated = function() {
    var who = this.findCallLogTargetById(this.mycallsclient_callLog.whoId);
    return this.getWhat() && (!who || who.object!='Lead');
};