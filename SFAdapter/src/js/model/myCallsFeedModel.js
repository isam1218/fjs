namespace("fjs.model");

fjs.model.MyCallsFeedModel = function(dataManager) {
    fjs.model.FeedModel.call(this, 'mycalls', dataManager);
    this.htCallIdToXpid = {};
    this.listeners["changepid"]= [];
    this.changes = {};
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


fjs.model.MyCallsFeedModel.prototype.onEntryDeletion = function(entry) {
        var htCallId = this.htCallIdByXpid(entry.xpid);
        if(!this.changes[htCallId]) {
            this.changes[htCallId]={};
        }
        this.changes[htCallId].delete = entry;

};

fjs.model.MyCallsFeedModel.prototype.onEntryChange = function(entry) {
        var htCallId = entry.htCallId;
        if(!this.changes[htCallId]) {
            this.changes[htCallId]={};
        }
        this.changes[htCallId].push = entry;
};

fjs.model.MyCallsFeedModel.prototype.onSyncComplete = function(data) {
        for(var i in this.changes) {
           if(this.changes.hasOwnProperty(i)) {
               var change = this.changes[i];
               if(change.push && !change.delete) {
                    var _data = change.push;
                    this.prepareEntry(_data);
                    this.items[_data.xpid] = _data.entry;
                    this.fireEvent("push", _data);
                }
               else if(!change.push && change.delete) {
                    var _data = change.delete;
                    delete this.items[_data.xpid];
                    this.fireEvent("delete", _data);
                }
               else if(change.push && change.delete) {
                    var _dataDel = change.delete;
                    var _dataPush = change.push;

                    delete this.items[_dataDel.xpid];
                    this.prepareEntry(_dataPush);
                    this.items[_dataPush.xpid] = _dataPush.entry;
                   _dataPush.oldPid = _dataDel.xpid;
                   _dataPush.eventType="changepid";
                    this.fireEvent("changepid", _dataPush);
                }
           }
        }
    this.changes={};
    this.fireEvent("complete", data);
};

