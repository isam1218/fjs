namespace("fjs.model");

fjs.model.MyCallEntryModel = function(obj) {
    function getCurrentDate() {
        var d = new Date();
        return d.getFullYear()+"-"+ (d.getMonth()+1) +"-"+d.getDate();
    }
    this._who = [];
    this._what = [];
    this.mycallsclient_callLog = {
        'date': getCurrentDate(),
        'subject': "Call",
        'xpid':this.xpid,
        'note': '',
        'callType': (this.incoming ? "inbound" : "outbound"),
        'isOpened':true,
        'tranferOpened':false,
        'whatId':null,
        'whoId':null,
        'what': {},
        'who': {}
    };
    fjs.model.EntryModel.call(this, obj);
};

fjs.model.MyCallEntryModel.extend(fjs.model.EntryModel);

fjs.model.MyCallEntryModel.HOLD_CALL_TYPE = 3;
fjs.model.MyCallEntryModel.RING_CALL_TYPE = 0;

fjs.model.MyCallEntryModel.prototype.onHold = function() {
    return this.state == fjs.model.MyCallEntryModel.HOLD_CALL_TYPE;
};

fjs.model.MyCallEntryModel.prototype.isRing = function() {
    return this.state == fjs.model.MyCallEntryModel.RING_CALL_TYPE;
};

fjs.model.MyCallEntryModel.prototype.hasWhos = function() {
    for(var key in this.mycallsclient_callLog.who) {
        if(this.mycallsclient_callLog.who[key]) return true;
    }
    return false;
};

fjs.model.MyCallEntryModel.prototype.hasWhats = function() {
    for(var key in this.mycallsclient_callLog.what) {
        if(this.mycallsclient_callLog.what[key]) return true;
    }
    return false;
};

fjs.model.MyCallEntryModel.prototype.findCallLogTargetById = function(type, id) {
    var arr;
    if(type == 'Contact' || type == 'Lead') {
       arr = this.mycallsclient_callLog.who[type];
    }
    else {
        arr = this.mycallsclient_callLog.what[type];
    }
    if(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]._id == id) {
                return arr[i];
            }
        }
    }
};

fjs.model.MyCallEntryModel.prototype.fillCallLogData = function(data, clientSettingsModel) {
    var whoLength = this._who.length,
        whatLength = this._what.length,
        _whatId = this.mycallsclient_callLog.whatId,
        _whoId = this.mycallsclient_callLog.whoId,
        _changed = false;

    this._who = [];
    this._what = [];
    var phoneMap = clientSettingsModel.items['phoneMap'] && clientSettingsModel.items['phoneMap'].phones || {};

    if(data && data.result) {
        var result = fjs.utils.JSON.parse(data.result);
        for(var i in result) {
            if (result.hasOwnProperty(i) && i != "screenPopUrl") {
                var _result = result[i];
                _result._id = i;
                if(_result.object == "Contact" || _result.object == "Lead") {
                    if(!this.mycallsclient_callLog.who[_result.object]) {
                        this.mycallsclient_callLog.who[_result.object] = [];
                    }
                    var item = this.findCallLogTargetById(_result.object, i);
                    if(!item) {
                        item = _result;
                        this.mycallsclient_callLog.who[_result.object].push(item);
                    }
                    else if(item.Name!=_result.Name) {
                         item.Name = _result.Name;
                         _changed = true;
                    }
                    item.new = true;

                    this._who.push(_result);
                }
                else {
                    if(_result.object == "Case") {
                        _result.Name = _result.CaseNumber;
                    }
                    if(!this.mycallsclient_callLog.what[_result.object]) {
                        this.mycallsclient_callLog.what[_result.object] = [];
                    }
                    var item = this.findCallLogTargetById(_result.object, i);
                    if(!item) {
                        item = _result;
                        this.mycallsclient_callLog.what[_result.object].push(item);
                    }
                    else if(item.Name!=_result.Name) {
                        item.Name = _result.Name;
                        _changed = true;
                    }
                    item.new = true;
                    this._what.push(_result);
                }
            }
        }
    }

    for(var _type in this.mycallsclient_callLog.who) {
        var _items = this.mycallsclient_callLog.who[_type].slice(0);
        for(var i=0; i<_items.length; i++) {
            var _item = _items[i];
            if(_item.new) {
                _item.new = false;
            }
            else {
                var index = this.mycallsclient_callLog.who[_type].indexOf(_item);
                if(index>-1) {
                    this.mycallsclient_callLog.who[_type].splice(index, 1);
                }
            }
        }
    }

    for(var _type in this.mycallsclient_callLog.what) {
        var _items = this.mycallsclient_callLog.what[_type].slice(0);
        for(var i=0; i<_items.length; i++) {
            var _item = _items[i];
            if(_item.new) {
                _item.new = false;
            }
            else {
                var index = this.mycallsclient_callLog.what[_type].indexOf(_item);
                if(index>-1) {
                    this.mycallsclient_callLog.what[_type].splice(index, 1);
                }
            }
        }
    }

    if(phoneMap[this.phone]) {
        var calleeInfo = phoneMap[this.phone];
        if(calleeInfo.type == "Contact") {
            this.mycallsclient_callLog.whoId = calleeInfo.id;
            this.mycallsclient_callLog.whatId = (this._what[0] && this._what[0]._id) || null;
        }
        else if(calleeInfo.type == "Lead") {
            this.mycallsclient_callLog.whoId = calleeInfo.id;
            this.mycallsclient_callLog.whatId = null;
        }
        else  {
            this.mycallsclient_callLog.whatId = calleeInfo.id;
            if(this.mycallsclient_callLog.who["Contact"]) {
                this.mycallsclient_callLog.whoId = this.mycallsclient_callLog.who["Contact"][0]._id || null;
            }
        }
        clientSettingsModel.deletePhone(this.phone);
    }
    else if(!phoneMap[this.phone] && !this.mycallsclient_callLog.whatId && !this.mycallsclient_callLog.whoId){
        if(this.mycallsclient_callLog.who["Contact"]) {
            this.mycallsclient_callLog.whoId = this.mycallsclient_callLog.who["Contact"][0]._id;
            this.mycallsclient_callLog.whatId = (this._what[0] && this._what[0]._id) || null;
        }
        else if(this.mycallsclient_callLog.who["Lead"]) {
            this.mycallsclient_callLog.whoId = this.mycallsclient_callLog.who["Lead"][0]._id;
            this.mycallsclient_callLog.whatId = null;
        }
        else {
            this.mycallsclient_callLog.whoId = null;
            this.mycallsclient_callLog.whatId = (this._what[0] && this._what[0]._id) || null;
        }
    }

    return _changed || this._what.length!= whatLength || this._who.length!= whoLength || _whatId!=this.mycallsclient_callLog.whatId || _whoId != this.mycallsclient_callLog.whoId;
};
