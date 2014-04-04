namespace("fjs.model");

fjs.model.MyCallsFeedModel = function() {
    fjs.model.FeedModel.call(this, fjs.app.SFAdapter.MY_CALLS_FEED_NAME);
    this.htCallIdToXpid = {};
    this.listeners["changepid"]= [];
    this.changes = {};
    this.currentSyncType = null;
};

fjs.model.MyCallsFeedModel.extends(fjs.model.FeedModel);

fjs.model.MyCallsFeedModel.prototype.prepareEntry = function(data) {
    this.htCallIdToXpid[data.entry.htCallId] = data.xpid;
    data.entry.xpid = data.xpid;
};

fjs.model.MyCallsFeedModel.prototype.htCallIdByXpid = function(xpid) {
     for(var htCallId in this.htCallIdToXpid) {
         if(this.htCallIdToXpid.hasOwnProperty(htCallId)) {
             if(this.htCallIdToXpid[htCallId] == xpid) return htCallId;
         }
     }
};

fjs.model.MyCallsFeedModel.prototype.onSyncStart = function(data) {
    this.currentSyncType = data.syncType;
    if(data.syncType == "F") {
        this.items = {};
    }
    this.fireEvent("start", data);
};

fjs.model.MyCallsFeedModel.prototype.onEntryDeletion = function(data) {
    if(this.currentSyncType!="F") {
        var htCallId = this.htCallIdByXpid(data.xpid);
        if(!this.changes[htCallId]) {
            this.changes[htCallId]={};
        }
        this.changes[htCallId].delete = data;
    }
    else {
        delete this.items[data.xpid];
        this.fireEvent("delete", data);
    }
};

fjs.model.MyCallsFeedModel.prototype.onEntryChange = function(data) {
    if(this.currentSyncType!="F") {
        var htCallId = data.entry.htCallId;
        if(!this.changes[htCallId]) {
            this.changes[htCallId]={};
        }
        this.changes[htCallId].push = data;
    }
    else {
        this.prepareEntry(data);
        this.items[data.xpid] = data.entry;
        this.fireEvent("push", data);
    }
};

fjs.model.MyCallsFeedModel.prototype.onSyncComplete = function(data) {
    if(this.currentSyncType!="F") {
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
    }
    this.changes={};
    this.fireEvent("complete", data);
};

