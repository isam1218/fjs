namespace("fjs.model");

fjs.model.MyCallsFeedModel = function(dataManager) {
    fjs.model.FeedModel.call(this, "mycallsclient", dataManager);
    /**
     * @type {Object}
     */
    this.htCallIdToXpid = {};
    this.listeners["changepid"]= [];
    /**
     * @type {Object}
     */
    this.changes = {};
    this.clientSettingsModel = this.dataManager.getModel('clientsettings');
};

fjs.model.MyCallsFeedModel.extend(fjs.model.FeedModel);

fjs.model.MyCallsFeedModel.prototype.prepareEntry = function(entry) {
    this.htCallIdToXpid[entry.htCallId] = entry.xpid;
};

fjs.model.MyCallsFeedModel.prototype.htCallIdByXpid = function(xpid) {
     for(var htCallId in this.htCallIdToXpid) {
         if(this.htCallIdToXpid.hasOwnProperty(htCallId)) {
             if(this.htCallIdToXpid[htCallId] == xpid) return htCallId;
         }
     }
};

fjs.model.MyCallsFeedModel.prototype.onEntryDeletion = function(event) {
        var htCallId = this.htCallIdByXpid(event.xpid);
        if(!this.changes[htCallId]) {
            this.changes[htCallId]={};
        }
        this.changes[htCallId].delete = event;
};

fjs.model.MyCallsFeedModel.prototype.onEntryChange = function(event) {
        var _entry = this.items[event.xpid], htCallId;
        if(_entry) {
            htCallId = _entry.htCallId;
        }
        else {
            htCallId = event.entry.htCallId;
        }

        if(!this.changes[htCallId]) {
            this.changes[htCallId]={};
        }
        this.changes[htCallId].push = event;
};

fjs.model.MyCallsFeedModel.prototype.getPhoneInfoAndOpenPopup = function(entry, changes) {
    if(entry.state == 0 && entry.incoming && changes.state == 2 && document.hasFocus()) {
        var message = {}, context=this;
        message.action = "getPhoneInfoAndOpenPopup";
        message.data = {};
        message.data.phoneSearch = entry.getFormattedPhone();
        message.data.phone = entry.phone;
        message.data.callType = "inbound";
        message.callback = function(){
            if(entry.fillCallLogData(data, context.dataManager.getModel('clientsettings'))) {
                context.dataManager.sendAction("mycallsclient", "push", {"callLog":  entry.mycallsclient_callLog, "xpid": entry.xpid});
            }
        };
        this.dataManager.sf.sendAction(message);
    }
};

fjs.model.MyCallsFeedModel.prototype.onSyncComplete = function(event) {
        for(var i in this.changes) {
           var _event, _entry;
           if(this.changes.hasOwnProperty(i)) {
               var change = this.changes[i];
               if(change.push && !change.delete) {
                   _event = change.push;
                   _entry = this.items[_event.xpid];
                   if(!_entry) {
                       _entry = this.items[_event.xpid] = new fjs.model.MyCallEntryModel(_event.entry);
                       this.order.push(_entry);
                   }
                   else {
                        this.getPhoneInfoAndOpenPopup(_entry, _event.entry);
                       _entry.fill(_event.entry)
                   }
                   this.prepareEntry(_entry);
                   this.fireEvent("push", _entry);
                   if((!this.clientSettingsModel.items["openedCall"]
                       || (this.clientSettingsModel.items["openedCall"].value!= null
                           &&  !this.items[this.clientSettingsModel.items["openedCall"].value]))
                       && (_entry.state == 2 || _entry.state == 0)) {
                       this.dataManager.sendAction('clientsettings' , "push", {"xpid": 'openedCall', "value":  _entry.xpid});
                   }
                   fjs.utils.Console.log('!!!!push ', _event.xpid, _event.entry);
                }
               else if(!change.push && change.delete) {
                   _event = change.delete;
                   var _item = this.items[_event.xpid];
                   var _index = this.order.indexOf(_item);
                   if(_index>-1) {
                        this.order.splice(_index, 1);
                   }
                   delete this.items[_event.xpid];
                   this.fireEvent("delete", _event);
                   fjs.utils.Console.log('!!!!delete ', _event.xpid);
                }
               else if(change.push && change.delete) {
                    var _dataDel = change.delete;
                    var _dataPush = change.push;

                    _entry = this.items[_dataDel.xpid];

                   this.getPhoneInfoAndOpenPopup(_entry, _dataPush.entry);

                    _entry.fill(_dataPush.entry);
                    delete this.items[_dataDel.xpid];
                    this.prepareEntry(_entry);
                    this.items[_dataPush.xpid] = _entry;
                    var openedCallId = this.clientSettingsModel.getEntryByXpid('openedCall');
                    if(openedCallId && openedCallId.value == _dataDel.xpid) {
                        this.dataManager.sendAction('clientsettings' , "push", {"xpid": 'openedCall', "value":  _dataPush.xpid});
                    }
                    _entry.oldPid = _dataDel.xpid;
                    _entry.pidChanged = true;
                   _dataPush.eventType="changepid";
                    this.fireEvent("changepid", _entry);
                   fjs.utils.Console.log('!!!!changepid ', "from:", _entry.oldPid, "to:", _dataPush.xpid);
                }
           }
        }

    this.changes={};
    this.fireEvent("complete", event);
    fjs.utils.Console.log('!!!OnCallsSyncEnd!!!');

};

fjs.model.MyCallsFeedModel.NAME = "mycallsclient";

