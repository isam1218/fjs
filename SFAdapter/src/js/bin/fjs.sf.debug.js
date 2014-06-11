fjs.utils.Console.log('Build number: ' + 1234567893);/**
 * Created with JetBrains WebStorm.
 * User: ddyachenko
 * Date: 19.08.13
 * Time: 16:06
 *
 * SFApi provides methods for communication with SF server side using Open CTI Api.
 */
var SFApi = function() {
    if (!SFApi.__instance)
        SFApi.__instance = this;
    else return SFApi.__instance;
};

/**
 * SFAdapter application namespace prefix.
 * It is used to have access to the custom objects and fields in package.
 * @type {string}
 */
SFApi.PREFIX = "Fon.";
SFApi.FON_LOGIN_CLASS_NAME = "FonLogin";

/**
 * Enables or disables click-to-dial.
 * @param isReg - if true SF click-to-dial function will be enabled and disabled otherwise.
 */
SFApi.prototype.enableCalls = function(isReg) {
    if(isReg) {
        sforce.interaction.cti.enableClickToDial();
    }
    else {
        sforce.interaction.cti.disableClickToDial();
    }
};

/**
 * Sets callback to click-to-deal.
 *
 * @param isPhoneReg - if true SF click-to-dial function will be enabled and disabled otherwise.
 * @param onCallCallback - JavaScript method called when the user clicks a phone number.
 * @result This method is asynchronous so it returns its response in an object in a callback method. The response object is a JSON string and contains the following fields:
 *  result: the phone number, object ID, and the name of the object from where the click was initiated;
 *  error: undefined, if the API call was successful and error message otherwise.
 */
SFApi.prototype.setPhoneApi = function(isPhoneReg, onCallCallback) {
    //Workaround  35530 SFA: Click to call icon greys out when changing location to @carrier
    this.enableCalls(true);
    sforce.interaction.cti.onClickToDial(onCallCallback);
};

/**
 * Creates a call log with specified parameters in Activity Task object.
 *
 * @param subject - the subject line of the call log, such as “Call” or “Send Quote.” Limit: 255 characters.
 * @param whoId - Contact or Lead ID of another side of the call
 * @param whatId - Account, Opportunity, Campaign, Case ID of another side of the call
 * @param note - text description of the task.
 * @param callType - the type of call being answered: Inbound, Internal, or Outbound.
 * @param duration - duration of the call in seconds.
 * @param date - the due date of the call log. Format: yyyy-MM-dd.
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an object in a callback method. The response object is a JSON string and contains
 * a new call log Id, if saving object was successful.
 */
SFApi.prototype.addCallLog = function (subject, whoId, whatId, note, callType, duration, date, callback) {
    var status  = "Completed";
    if(whoId == null && whoId== null) {
        status = "Not Started";
    }
    var args = "Subject=" + encodeURIComponent(subject)
               + "&CallType=" + callType
               + "&CallDurationInSeconds=" + duration
               + "&Status=" + status
               + "&Type=Call"
               + "&ActivityDate=" + date;
    if(whoId)
    {
       args += "&WhoId=" + whoId;
    }
    if(whatId)
    {
        args += "&WhatId=" + whatId;
    }
    SFApi.prototype.getCalllogCommentField( function(data){
        var commentFieldName = "Description";
        if(data && data.result) {
            if(data.result != null && data.result != "")
            {
                commentFieldName = data.result;
            }
        }
        args += "&" + commentFieldName + "=" + encodeURIComponent(note);
        if(duration && date && callType) {
            sforce.interaction.saveLog('Task',args, function(result) {
                callback(result);
            });
        }
        else {
            fjs.utils.Console.error('Wrong arguments for adding call log.')
        }
    })
};

/**
 * Searches objects specified in the SoftPhone layout for a given string. Returns search results and screen pops any matching records.
 * This method respects screen pop settings defined in the SoftPhone layout.
 *
 * @param phone - phone number string to search.
 * @param callType - the type of call being answered: Inbound or Outbound.
 * @param callback - JavaScript method called upon completion of the method.
 * @param isRinging - true, if call is in ring state, false otherwise.
 * @result This method is asynchronous so it returns its response in an object in a callback method. The response object contains the following fields:
 *  result - a list of objects that match the search results and the URL to the screen pop (screenPopURL).The search is performed on the objects specified in the SoftPhone layout.
 *  For each object found, the object ID, field names, and field values are returned as a JSON string.
 *  error - undefined if the API call was successful, error message otherwise.
 */
SFApi.prototype.getPhoneInfo = function (phone, callType, isRinging, callback) {
    if(isRinging) {
        var params = "acc10=" + phone + "&con10=" + phone + "&lea8=" + phone;
        sforce.interaction.searchAndScreenPop(phone, params, callType, callback);
    }
    sforce.interaction.searchAndGetScreenPopUrl(phone, '', callType, callback);
};

/**
 * Pops to a target URL, which must be relative.
 *
 * @param id - SF record id of th object to open.
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an object in a callback method. The response object contains the following fields:
 *  result - true if the screen pop was successful, false if the screen pop wasn’t successful;
 *  error - undefined if the API call was successful, error message otherwise.
 */
SFApi.prototype.openUser = function (id, callback) {
    sforce.interaction.screenPop('/' + id, true, callback);
};

/**
 * Sets SoftPhone height.
 *
 * @param height - SoftPhone height in pixels. The height should be a number that’s equal or greater than 0.
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an object in a callback method. The response object contains the following fields:
 *  result - true if the width was set successfully, false if setting the width wasn’t successful;
 *  error - undefined if the API call was successful, error message otherwise.
 */
SFApi.prototype.setSoftphoneHeight = function (height, callback) {
    sforce.interaction.cti.setSoftphoneHeight(height, callback);
};

/**
 * Sets SoftPhone width.
 *
 * @param width - SoftPhone width in pixels. The width should be a number that’s equal or greater than 0.
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an object in a callback method. The response object contains the following fields:
 *  result - true if the width was set successfully, false if setting the width wasn’t successful;
 *  error - undefined if the API call was successful, error message otherwise.
 */
SFApi.prototype.setSoftphoneWidth = function (width, callback) {
    sforce.interaction.cti.setSoftphoneWidth(width, callback);
};

/**
 * Returns user login information to the callback.
 *
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an Json object in the callback method. The object contains the following strings:
 *  admLogin - administrator login;
 *  admPassword - administrator password;
 *  serverUrl - FDP server URL;
 *  email - SF user login;
 *  hudLogin - HUD user login.
 */
SFApi.prototype.getLoginInfo = function (callback) {
    sforce.interaction.runApex(SFApi.PREFIX + SFApi.FON_LOGIN_CLASS_NAME, "getLoginInfo", null, callback);
};

/**
 * Returns to the callback a cal log comment field name.
 *
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an string object in the callback method. This object is string with field name or null.
 */
SFApi.prototype.getCalllogCommentField = function (callback) {
    sforce.interaction.runApex(SFApi.PREFIX + SFApi.FON_LOGIN_CLASS_NAME, "getCalllogFieldName", null, callback);
};




/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");

fjs.sf.SFSimpleProvider = function() {
    if (!fjs.sf.SFSimpleProvider.__instance){
        var tabsSynchronizer = new fjs.api.TabsSynchronizer();
        var context = this;
        this.isMaster =tabsSynchronizer.isMaster;
        tabsSynchronizer.addEventListener("master_changed", function() {
            context.isMaster = tabsSynchronizer.isMaster;
        });
        this.api = new SFApi();
        fjs.sf.SFSimpleProvider.__instance = this;
    }
    return fjs.sf.SFSimpleProvider.__instance;
};

fjs.sf.SFSimpleProvider.prototype.sendAction = function(message) {
    if(this.isMaster) {
        switch (message.action) {
            case "enableCalls":
                this.api.enableCalls(message.data.isReg, message.callback);
                break;
             case "addCallLog":
                this.api.addCallLog(message.data.subject, message.data.whoId, message.data.whatId, message.data.note, message.data.callType,
                    message.data.duration, message.data.date, message.callback);
                break;
            case "getPhoneInfo":
                this.api.getPhoneInfo(message.data.phone, message.data.callType, message.data.isRinging, message.callback);
                break;
            case "getCalllogCommentField":
                this.api.getCalllogCommentField(message.callback);
                break;
        }
    }
    switch (message.action) {
        case "getLoginInfo":
            this.api.getLoginInfo(message.callback);
            break;
        case "setSoftphoneHeight":
            this.api.setSoftphoneHeight(message.data.height, message.callback);
            break;
        case "setSoftphoneWidth":
            this.api.setSoftphoneWidth(message.data.width, message.callback);
            break;
        case "setPhoneApi":
            this.api.setPhoneApi(message.data.isPhoneReg, message.callback);
            break;
        case "openUser":
            this.api.openUser(message.data.id, message.callback);
            break;
    }
};

fjs.sf.SFSimpleProvider.check = function() {
    return true;
};

/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");
fjs.sf.SFSharedWorkerProvider = function() {
    if (!fjs.sf.SFSharedWorkerProvider.__instance) {
        var context = this;
        this.callbacks = {};
        this.worker = new SharedWorker("js/salesforce_api/sf_shared_worker.js");
        this.worker.port.addEventListener("message", function (e) {
            fjs.utils.Console.log(e);
            if (e.data["eventType"] == "ready") {
                context.sendAction({action: 'init'});
            }
            else {
                var callback = context.callbacks.get(e.id);
                callback(e.data);
                delete  context.callbacks[e.id];
            }
        }, false);

        this.worker.port.addEventListener("error", function (e) {
            fjs.utils.Console.error("Worker Error", e);
        });
        this.worker.port.start();
        this.worker.port.postMessage("ping'");

        this.sendAction = function(message) {
            if(message) {
                var id = fjs.utils.GUID.create();
                context.callbacks[id] = message.callback;
                message.id = id;
                message.callback = null;
            }
            context.worker.port.postMessage(message);
        };

        fjs.sf.SFSharedWorkerProvider.__instance = this;
    }
    return fjs.sf.SFSharedWorkerProvider.__instance;
};

/**
 * @returns {boolean}
*/
fjs.sf.SFSharedWorkerProvider.check = function() {
    return  !!self.SharedWorker;
};
/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");

fjs.sf.SFApiProviderFactory = function() {
    this._providers = {
          'sharedWorker': fjs.sf.SFSharedWorkerProvider
        , 'simple': fjs.sf.SFSimpleProvider
    };
};

fjs.sf.SFApiProviderFactory.prototype.getProvider = function() {
    return new fjs.sf.SFSimpleProvider();
};var sfa_model = angular.module('SF_API', []);

sfa_model.service('SFApi', fjs.sf.SFApiProviderFactory);namespace("fjs.model");
/**
 * @param feedName
 * @param dataManager
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.model.FeedModel = function(feedName, dataManager) {
    fjs.EventsSource.call(this);
    this.feedName = feedName;
    this.items = {};
    this.order = [];
    this.dataManager = dataManager;
    this.listeners = {
        "start":[]
        , "push":[]
        , "delete":[]
        , "complete": []
    };
    this.init();
};

fjs.model.FeedModel.extend(fjs.EventsSource);

fjs.model.FeedModel.EVENT_TYPE_START = "start";
fjs.model.FeedModel.EVENT_TYPE_PUSH = "push";
fjs.model.FeedModel.EVENT_TYPE_DELETE = "delete";
fjs.model.FeedModel.EVENT_TYPE_CHANGE= "change";
fjs.model.FeedModel.EVENT_TYPE_COMPLETE = "complete";

fjs.model.FeedModel.prototype.getEntryByXpid = function(xpid) {
    return this.items[xpid];
};

fjs.model.FeedModel.prototype.init = function() {
    var context = this;
    this.dataManager.addEventListener(this.feedName, function(data){
        context.onSyncStart();
        for(var key in data.changes) {
            if(data.changes.hasOwnProperty(key)) {
                var change = data.changes[key];
                if(fjs.model.FeedModel.EVENT_TYPE_CHANGE == change.type) {
                    context.onEntryChange(change);
                }
                else if(fjs.model.FeedModel.EVENT_TYPE_DELETE == change.type) {
                    context.onEntryDeletion(change);
                }
                else {
                    fjs.utils.Console.error("Unknown change type:", change.type);
                }
            }
        }
        context.onSyncComplete();
    });
};

fjs.model.FeedModel.prototype.prepareEntry = function(data) {
};

fjs.model.FeedModel.prototype.onSyncStart = function(data) {
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_START, data);
};

fjs.model.FeedModel.prototype.onEntryDeletion = function(event) {
    var item = this.items[event.xpid];
    var index = this.order.indexOf(item);
    if(index>-1){
        this.order.splice(index, 1);
    }
    delete this.items[event.xpid];
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_DELETE, event);
};

fjs.model.FeedModel.prototype.onEntryChange = function(event) {
    var entry = this.items[event.xpid];
    if(!entry) {
        entry = this.items[event.xpid] = new fjs.model.EntryModel(event.entry);
        this.order.push(entry);
    }
    else {
        entry.fill(event.entry);
    }
    this.prepareEntry(entry);

    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_PUSH, entry);
};

fjs.model.FeedModel.prototype.onSyncComplete = function(data) {
    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_COMPLETE, data);
};

fjs.model.FeedModel.prototype.addEventListener = function(eventType, callback) {
    fjs.EventsSource.prototype.addEventListener.call(this, eventType, callback);
    if(eventType==fjs.model.FeedModel.EVENT_TYPE_PUSH) {
       for(var i in this.items) {
           if(this.items.hasOwnProperty(i))
                callback({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:i, entry:this.items[i]});
       }
    }
};
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
};namespace("fjs.model");
/**
 * @param {fjs.model.DataManager} dataManager
 * @constructor
 * @extends fjs.model.FeedModel
 */
fjs.model.MeModel = function(dataManager) {
    fjs.model.FeedModel.call(this, fjs.model.MeModel.NAME, dataManager);
    this.property2key = {};
    this.propertyKey2Xpid = {};
};

fjs.model.MeModel.extend(fjs.model.FeedModel);

fjs.model.MeModel.prototype.onEntryChange = function(data) {
    if(data.entry) {
        if (data.entry.propertyKey) {
            this.propertyKey2Xpid[data.xpid] = data.entry.propertyKey;
            this.property2key[data.entry.propertyKey] = data.entry.propertyValue;
        }
        else {
            this.property2key[this.propertyKey2Xpid[data.xpid]] = data.entry.propertyValue;
        }
        this.superClass.onEntryChange.call(this, data);
    }
    else {
        debugger;
    }
};

fjs.model.MeModel.prototype.onEntryDeletion = function(data) {
    var key = this.propertyKey2Xpid[data.xpid];
    delete this.propertyKey2Xpid[data.xpid];
    delete this.property2key[key];
    this.superClass.onEntryDeletion.call(this, data);
};

fjs.model.MeModel.prototype.getProperty = function(key) {
    return this.property2key[key];
};

fjs.model.MeModel.NAME = "me";namespace("fjs.model");

fjs.model.MyCallsFeedModel = function(dataManager) {
    fjs.model.FeedModel.call(this, "mycallsclient", dataManager);
    this.htCallIdToXpid = {};
    this.listeners["changepid"]= [];
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

fjs.model.MyCallsFeedModel.prototype.onSyncComplete = function(event) {
        for(var i in this.changes) {
           if(this.changes.hasOwnProperty(i)) {
               var change = this.changes[i];
               if(change.push && !change.delete) {
                   var _event = change.push;
                   var _entry = this.items[_event.xpid];
                   if(!_entry) {
                       _entry = this.items[_event.xpid] = new fjs.model.MyCallEntryModel(_event.entry);
                       this.order.push(_entry);
                   }
                   else {
                       _entry.fill(_event.entry)
                   }
                   this.prepareEntry(_entry);
                   this.fireEvent("push", _entry);
                   if((!this.clientSettingsModel.items["openedCall"] || (this.clientSettingsModel.items["openedCall"].value!= null &&  !this.items[this.clientSettingsModel.items["openedCall"].value])) && (_entry.state == 2 || _entry.state == 0)) {
                       this.dataManager.sendAction('clientsettings' , "push", {"xpid": 'openedCall', "value":  _entry.xpid});
                   }
                   fjs.utils.Console.log('!!!!push ', _event.xpid, _event.entry);
                }
               else if(!change.push && change.delete) {
                    var _event = change.delete;
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

                    var _entry = this.items[_dataDel.xpid];

                    _entry.fill(_dataPush.entry);

                    delete this.items[_dataDel.xpid];
                    this.prepareEntry(_entry);
                    this.items[_dataPush.xpid] = _entry;
                    _entry.oldPid = _dataDel.xpid;
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

fjs.model.MyCallEntryModel.prototype.callLogItemUpdate = function() {

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
                        this.mycallsclient_callLog.who[_result.object].push(_result);
                    }
                    else if(item.Name!=_result.Name) {
                         item.Name = _result.Name;
                         _changed = true;
                    }
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
                        this.mycallsclient_callLog.what[_result.object].push(_result);
                    }
                    else if(item.Name!=_result.Name) {
                        item.Name = _result.Name;
                        _changed = true;
                    }
                    this._what.push(_result);
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
namespace('fjs.model');

fjs.model.ClientSettingsFeedModel = function(dataManager) {
    fjs.model.FeedModel.call(this, "clientsettings", dataManager);
};
fjs.model.ClientSettingsFeedModel.extend(fjs.model.FeedModel);
fjs.model.ClientSettingsFeedModel.prototype.savePhone = function(phone, calleeInfo) {
    if(this.items['phoneMap']) {
        this.items['phoneMap'].phones[phone] = calleeInfo;
        this.dataManager.sendAction("clientsettings", "push", this.items["phoneMap"]);
    }
    else {
        var phoneMapObj = {xpid: 'phoneMap', phones:{}};
        phoneMapObj.phones[phone] = calleeInfo;
        this.dataManager.sendAction("clientsettings", "push", phoneMapObj);
    }
};

fjs.model.ClientSettingsFeedModel.prototype.deletePhone = function(phone) {
    if(this.items['phoneMap']) {
        delete this.items['phoneMap'].phones[phone];
        this.dataManager.sendAction("clientsettings", "push", this.items["phoneMap"]);
    }
}
namespace("fjs.model");
/**
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.model.DataManager = function(sf) {
    fjs.EventsSource.call(this);

    this.feeds = {};
    this.ticket = null;
    this.node = null;
    this.phoneMap = {};

    this.state = -1;
    this.suspendFeeds = [];
    this.warningListeners = {};

    this.sf = sf.getProvider();

    var context = this;
    var providerFactory = new fjs.api.FDPProviderFactory();

    this.authErrorCount = 0;
    this.MAX_AUTH_ERROR_COUNT = 3;

    var onClickToDial = function(obj) {
        /**
         * @type {{number:string, objectId:string, object:string}}
         */
        var res = obj && obj.result && JSON.parse(obj.result);
        var phone = res.number;
        if (phone) {
            var calleeInfo = {};
            calleeInfo.id = res.objectId;
            calleeInfo.type = res.object;
            var clientSettingsModel = context.getModel('clientsettings');
            clientSettingsModel.savePhone(phone, calleeInfo);
            context.sendAction(fjs.model.MeModel.NAME, "callTo", {'phoneNumber': phone});
        }
    };



    this.checkDevice = function() {
        var message = {};
        message.action = "setPhoneApi";
        message.data = {};
        message.data.isReg = true;
        message.callback = onClickToDial;
        context.sf.sendAction(message);
    };
    this.checkDevice();

    this._getAuthInfo(function(data){
        if(data) {
            if(context._authInfoChanged(data) || !context._getAccessInfo()) {
                 fjs.utils.Cookies.remove(fjs.model.DataManager.AUTH_COOKIE_NAME);
                 context.dataProvider = providerFactory.getProvider(null, null, function() {
                     context.dataProvider.sendMessage({action: "SFLogin", data: data});
                     context.state = 1;
                 });
            }
            else {
                 context.dataProvider = providerFactory.getProvider(context.ticket, context.node, function() {
                     context.state = 1;
                     if(context.suspendFeeds.length>0) {
                         for(var i=0; i<context.suspendFeeds.length; i++) {
                             context.dataProvider.addSyncForFeed(context.suspendFeeds[i]);
                         }
                         context.suspendFeeds=[];
                     }
                 });
            }
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_SYNC, function(data) {
                data = data["data"] || data;
                context.fireEvent(data.feed, data);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_AUTH_ERROR, function(e) {
                if(context.authErrorCount < context.MAX_AUTH_ERROR_COUNT) {
                    context._getAuthInfo(function(data){
                        context.dataProvider.sendMessage({action: "SFLogin", data: data});
                    });
                    context.authErrorCount++;
                }
                else {
                    context.fireWarningEvent(fjs.model.DataManager.AUTHORIZATION_STATE, false);
                }
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_REQUEST_ERROR, function(e) {
                fjs.utils.Console.error(e);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_NETWORK_PROBLEM, function(e) {
                fjs.utils.Console.error(e);
                context.fireWarningEvent(fjs.model.DataManager.CONNECTION_STATE, false);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_CONNECTION_ESTABLISHED, function(e) {
                fjs.utils.Console.info(e);
                context.fireWarningEvent(fjs.model.DataManager.CONNECTION_STATE, true);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_NODE, function(e) {
                fjs.utils.Cookies.set(fjs.model.DataManager.NODE_COOKIE_NAME, context.node = e.data.nodeId);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_TICKET, function(e) {
                fjs.utils.Cookies.set(fjs.model.DataManager.AUTH_COOKIE_NAME, context.ticket = e.data.ticket);
                context.fireWarningEvent(fjs.model.DataManager.AUTHORIZATION_STATE, true);
                if(context.suspendFeeds.length>0) {
                    for(var i=0; i<context.suspendFeeds.length; i++) {
                        context.dataProvider.addSyncForFeed(context.suspendFeeds[i]);
                    }
                    context.suspendFeeds=[];
                }
            });
        }
    });
};
fjs.model.DataManager.extend(fjs.EventsSource);

fjs.model.DataManager.AUTHORIZATION_STATE = "Authorization";
fjs.model.DataManager.CONNECTION_STATE = "Connection";

fjs.model.DataManager.EV_SYNC = "sync";
fjs.model.DataManager.EV_AUTH_ERROR = "authError";
fjs.model.DataManager.EV_REQUEST_ERROR = "requestError";
fjs.model.DataManager.EV_NETWORK_PROBLEM = "networkProblem";
fjs.model.DataManager.EV_CONNECTION_ESTABLISHED = "connectionEstablished";
fjs.model.DataManager.EV_TICKET = "ticket";
fjs.model.DataManager.EV_NODE = "node";

fjs.model.DataManager.AUTH_COOKIE_NAME = "SF_Authorization";
fjs.model.DataManager.NODE_COOKIE_NAME = "SF_Node";
fjs.model.DataManager.CLIENT_ID_COOKIE_NAME = "SF_Client_id";
fjs.model.DataManager.SERVER_URL_COOKIE_NAME = "SF_ServerUrl";
fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME = "SF_Login";
fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME = "SF_Email";

fjs.model.DataManager.prototype.getModel = function(feedName) {
    if (!this.feeds[feedName]) {
        switch (feedName) {
            case fjs.model.MeModel.NAME:
                this.feeds[feedName] = new fjs.model.MeModel(this);
                break;
            case "mycallsclient":
               this.feeds[feedName] = new fjs.model.MyCallsFeedModel(this);
               break;
            case "clientsettings":
                this.feeds[feedName] = new fjs.model.ClientSettingsFeedModel(this);
                break;
            default:
               this.feeds[feedName] = new fjs.model.FeedModel(feedName, this);
                break;
        }
    }
    return this.feeds[feedName];
};

/**
* Sends action to FDP server
* @param {string} feedName
* @param {string} action
* @param {*} data
*/

fjs.model.DataManager.prototype.sendAction = function(feedName, action, data) {
    if(this.dataProvider) {
        this.dataProvider.sendMessage({"action":"fdp_action", "data": {"feedName":feedName, "actionName":action, "params": data}});
    }
};

/**
 * @param userData
 * @returns {boolean}
 * @private
 */
fjs.model.DataManager.prototype._authInfoChanged = function(userData) {
    var authInfoChanged = false;
    if(fjs.utils.Cookies.get(fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME) != userData.hud) {
        fjs.utils.Cookies.set(fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME, userData.hud);
        authInfoChanged = true;
    }
    if(fjs.utils.Cookies.get(fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME) != userData.email) {
        fjs.utils.Cookies.set(fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME, userData.email);
        authInfoChanged = true;
    }
    return authInfoChanged;
};

fjs.model.DataManager.prototype._getAccessInfo = function() {
    this.ticket = fjs.utils.Cookies.get(fjs.model.DataManager.AUTH_COOKIE_NAME);
    this.node = fjs.utils.Cookies.get(fjs.model.DataManager.NODE_COOKIE_NAME);
    return this.ticket;
};

fjs.model.DataManager.prototype._getAuthInfo = function(callback) {
    var message = {};
    message.action = "getLoginInfo";
    message.callback = function(response) {
        var data = null;
        /**
         * @type {{admLogin:string, admPassword:string, email:string, hudLogin:string, serverUrl:string}}
         */
        var res = null;
        if (response) {
            if (response.error) {
                fjs.utils.Console.error("SF response error", response.error);
                callback(null);
            }
            else {
                res = JSON.parse(response.result);
            }
        }
        if (res) {
            data = {
                "login": res.admLogin, "token": res.admPassword, "email": res.email
            };
            if (res.hudLogin) {
                data.hud = res.hudLogin;
            }
            fjs.fdp.CONFIG.SERVER.serverURL = res.serverUrl;
        }
        callback(data);
    };
    this.sf.sendAction(message);
};

fjs.model.DataManager.prototype.addEventListener = function(feedName, handler) {
    if(!this.listeners[feedName] || this.listeners[feedName].length == 0) {
        if(this.state!=1 && this.suspendFeeds.indexOf(feedName)<0) {
            this.suspendFeeds.push(feedName);
        }
        else {
            this.dataProvider.addSyncForFeed(feedName);
        }
    }
    this.superClass.addEventListener.call(this, feedName, handler);
};

fjs.model.DataManager.prototype.addWarningListener = function(eventType, callback) {
    if(this.warningListeners[eventType]) {
        this.warningListeners[eventType].push(callback);
    }
    else {
        var events = [];
        events.push(callback);
        this.warningListeners[eventType] = events;
    }
};

fjs.model.DataManager.prototype.removeWarningListener = function(eventType, callback) {
    var i =this.warningListeners[eventType].indexOf(callback);
    if(i > -1) {
        this.warningListeners[eventType].splice(i, 1);
    }
};

fjs.model.DataManager.prototype.fireWarningEvent = function(eventType, data) {
    var listeners = this.warningListeners[eventType];
    if(listeners) {
        for(var i=0; i<listeners.length; i++) {
            listeners[i](data);
        }
    }
};
var sfa_model = angular.module('SFA_model', ['SF_API']);

sfa_model.service('DataManager', ['SFApi', fjs.model.DataManager]);

namespace("fjs.controllers");
fjs.controllers.CommonController = function() {
};

fjs.controllers.CommonController.prototype.safeApply = function($scope, fn) {
    var phase = $scope.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
            fn();
        }
    } else {
        $scope.$apply(fn);
    }
};

fjs.controllers.CommonController.COMPLETE_LISTENER = "complete";
fjs.controllers.CommonController.PUSH_LISTENER = "push";
fjs.controllers.CommonController.DELETE_LISTENER = "delete";
/**
 * 123
 */
namespace("fjs.controllers");
fjs.controllers.CallController = function($scope, $element, $timeout, $filter, $sce, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var callsFeedModel = dataManager.getModel("mycallsclient");
    var durationTimer = null;
    var callLogInfoTimeout = null;
    var timeSync = new fjs.utils.TimeSync();
    var lastPhone = null;
    var context = this;
    var callLogSaveTimeout = null;
    var sfApiProvider = sfApi.getProvider();
    var clientSettingsModel = dataManager.getModel('clientsettings');

    $scope.getTriangle = function() {
        return $sce.trustAsHtml($scope.call.mycallsclient_callLog.isOpened ? fjs.controllers.CallController.OPENED_TRIANGLE : fjs.controllers.CallController.CLOSED_TRIANGLE);
    };

    var tabsSynchronizer = new fjs.api.TabsSynchronizer();
    var masterListener = function() {
        if(tabsSynchronizer.isMaster) {
            startGetCallLogInfo();
        }
        else {
            stopGetCallInfo();
        }
    };

    tabsSynchronizer.addEventListener("master_changed", masterListener);

    var onDurationTimeout = function() {
        var date = new Date();
        var time =  date.getTime()-  timeSync.getDefault() + (new Date(1).getTimezoneOffset() * 1000 * 60);
        var timeDur = time - $scope.call.created;
        var timeHoldDur = time - $scope.call.holdStart;

        $scope.call.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        if($scope.call.onHold()) {
            $scope.call.holdDuration = $filter('date')(new Date(timeHoldDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC);
    };
    onDurationTimeout();

    function callInfoCallback(data) {
        if(context) {
            if ($scope.call.fillCallLogData(data, clientSettingsModel)) {
                saveCallLogChanges();
                context.safeApply($scope);
            }
        }
    }

    function getCallLogInfo() {
        stopGetCallInfo();
        lastPhone = $scope.call.phone;
        if(lastPhone) {
            var rawPhone =  $scope.call.phone.replace(/\(|\)|-/g, ''); //TODO check other symbols (+, *)
            if(rawPhone.length > 10) {
                rawPhone = rawPhone.slice(rawPhone.length - 10, rawPhone.length);
            }
            if($scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
                var message = {};
                message.action = "getPhoneInfo";
                message.data = {};
                message.data.phone = rawPhone;
                message.data.callType = ($scope.call.incoming ? "inbound" : "outbound");
                message.data.isRinging = ($scope.call.state == 0);
                message.callback = callInfoCallback;
                sfApiProvider.sendAction(message);
            }
            startGetCallLogInfo();
        }
    }

    $scope.showWhatSelect = function() {
        return $scope.call.hasWhats() && !$scope.call.findCallLogTargetById('Lead', $scope.call.mycallsclient_callLog.whoId);
    };

    $scope.getWhatArray = function() {
        var arr = [];
        for(var type in $scope.call.mycallsclient_callLog.what) {
            arr = arr.concat($scope.call.mycallsclient_callLog.what[type]);
        }
        return arr;
    };

    $scope.getWhoArray = function() {
        var arr = [];
        for(var type in $scope.call.mycallsclient_callLog.who) {
            arr = arr.concat($scope.call.mycallsclient_callLog.who[type]);
        }
        return arr;
    };

    $scope.whoChange = function() {
        if($scope.call.mycallsclient_callLog.who["Lead"] && $scope.call.mycallsclient_callLog.who["Lead"].indexOf($scope.call.mycallsclient_callLog.whoId)>-1) {
            $scope.call.mycallsclient_callLog.pervWhatId = $scope.call.mycallsclient_callLog.whatId;
            $scope.call.mycallsclient_callLog.whatId = null;

        }
        else if($scope.call.mycallsclient_callLog.whatId == null) {
            if($scope.call.mycallsclient_callLog.pervWhatId) {
                $scope.call.mycallsclient_callLog.whatId = $scope.call.mycallsclient_callLog.pervWhatId;
            }
            else {
                for(var key in $scope.call.mycallsclient_callLog.what) {
                    if($scope.call.mycallsclient_callLog.what[key]) {
                        $scope.call.mycallsclient_callLog.whatId = $scope.call.mycallsclient_callLog.what[key][0];
                    }
                }
            }
        }
        saveCallLogChanges()
    };

    $scope.whatChange = function() {
        saveCallLogChanges();
    };

    function saveCallLogChanges() {
        if(callLogSaveTimeout != null) {
            clearTimeout(callLogSaveTimeout);
            callLogSaveTimeout = null;
        }
        callLogSaveTimeout = setTimeout(function() {

            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        },fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC);
    }

    $scope.noteChange = function() {
        saveCallLogChanges();
    };


    $scope.$watch("call.phone", function() {
        getCallLogInfo();
    });

    $scope.hold = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferToHold", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.accept = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "answer", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.transfer = function() {
        $scope.call.mycallsclient_callLog.tranferOpened = true;
        $scope.call.mycallsclient_callLog.isOpened = false;
        saveCallLogChanges();
    };

    $scope.end = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "hangup", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.unhold = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferFromHold", {"mycallId":$scope.call.xpid });
        return false;
    };

    function closeCallLog() {
        $scope.call.mycallsclient_callLog.isOpened = false;
        saveCallLogChanges();
    }

    function openCallLog() {
        $scope.call.mycallsclient_callLog.isOpened = true;
        $scope.call.mycallsclient_callLog.tranferOpened = false;
        saveCallLogChanges();
    }

    $scope.toggleCallLog = function() {
        if($scope.call.mycallsclient_callLog.isOpened) {
            closeCallLog();
        }
        else {
            openCallLog();
        }
    };

    $scope.openSFLink = function(id) {
        var message = {};
        message.action = "openUser";
        message.data = {};
        message.data.id = id;
        sfApiProvider.sendAction(message);
    };

    $scope.closeTransferDialog = function() {
        openCallLog();
    };

    $scope.$on('transfer', function(event, number) {
        if(number) {
            dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferTo", {"mycallId":$scope.call.xpid, "toNumber":number });
        }
        openCallLog();
    });

    $scope.$on("$destroy", function() {
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
        tabsSynchronizer.removeEventListener("master_changed", masterListener);
        stopGetCallInfo();
        if($scope.call.mycallsclient_callLog && $scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
            initCallLogSubject();
            var message = {};
            message.action = "addCallLog";
            message.data = {};
            message.data.subject = $scope.call.mycallsclient_callLog.subject;
            message.data.whoId =  $scope.call.mycallsclient_callLog.whoId;
            message.data.whatId = $scope.call.mycallsclient_callLog.whatId;
            message.data.note = $scope.call.mycallsclient_callLog.note;
            message.data.callType =  ($scope.call.incoming ? "inbound" : "outbound");
            message.data.duration = Math.round((new Date().getTime()- ($scope.call.created + timeSync.getDefault()))/1000);
            message.data.date = $scope.call.mycallsclient_callLog.date;
            message.callback =  function(response) {
                fjs.utils.Console.error(response);
            };
            sfApiProvider.sendAction(message);

        }
        context = null;
        clearTimeout(callLogSaveTimeout);
    });

    function initCallLogSubject() {
        if($scope.call.mycallsclient_callLog.note && $scope.call.mycallsclient_callLog.note != "") {
            $scope.call.mycallsclient_callLog.subject = "Call: " + $scope.call.mycallsclient_callLog.note.substr(0, 240) + " ...";
        }
        else {
            $scope.call.mycallsclient_callLog.subject = "Call";
        }
    }


    function stopGetCallInfo() {
        if(callLogInfoTimeout) {
            $timeout.cancel(callLogInfoTimeout);
            callLogInfoTimeout = null;
        }
    }

    function startGetCallLogInfo() {
        callLogInfoTimeout = $timeout(getCallLogInfo, fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC);
    }
};

fjs.controllers.CallController.extend(fjs.controllers.CommonController);

fjs.controllers.CallController.CONFERENCE_CALL_TYPE = 0;
fjs.controllers.CallController.SYSTEM_CALL_TYPE = 7;
fjs.controllers.CallController.HOLD_CALL_TYPE = 3;
fjs.controllers.CallController.RING_CALL_TYPE = 0;
fjs.controllers.CallController.TALCKING_CALL_TYPE = 2;
fjs.controllers.CallController.OPENED_TRIANGLE = "&#9660;";
fjs.controllers.CallController.CLOSED_TRIANGLE = "&#9658;";
fjs.controllers.CallController.SORT_FIELD_NAME = "Name";
fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC = 3000;
fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC = 500;
namespace("fjs.controllers");

fjs.controllers.CallsListController = function($scope, dataManager) {
    this.callsFeedModel = dataManager.getModel("mycallsclient");
    var context = this;

    fjs.controllers.CommonController.call(this, $scope);

    var clientSettingsModel = dataManager.getModel('clientsettings');

    $scope.calls = this.callsFeedModel.order;

    $scope.selectedCallId = clientSettingsModel.items['openedCall'] && clientSettingsModel.items['openedCall'].value;

    $scope.selectCall = function(callId) {
        if($scope.selectedCallId!=callId) {
            $scope.selectedCallId = callId;
        }
        else {
            $scope.selectedCallId = null;
        }
        dataManager.sendAction('clientsettings' , "push", {"xpid": 'openedCall', "value":  $scope.selectedCallId});
    };

    this.clientSettingsListener = function() {
        $scope.selectedCallId = clientSettingsModel.items['openedCall'] && clientSettingsModel.items['openedCall'].value;
        context.safeApply($scope);
    };

    this.completeCallsListener = function() {
        context.safeApply($scope);
    };
    clientSettingsModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.clientSettingsListener);
    this.callsFeedModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeCallsListener);
};

fjs.controllers.CallsListController.extend(fjs.controllers.CommonController);

fjs.controllers.CallsListController.SELECTED_CALL_ID = "selected_call_id";
fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE= "selected_call_id_mode";
namespace("fjs.controllers");
fjs.controllers.MainController = function($scope, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var context = this;
    var sfApiProvider = sfApi.getProvider();

    this.clientSettingsModel = dataManager.getModel(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL );
    this.clientSettingsModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, onClientSettingsPush);
    this.meModel = dataManager.getModel(fjs.model.MeModel.NAME);
    this.SOFTPHONE_WIDTH = 200;
    this.SOFTPHONE_HEIGHT = 200;
    this.FRAME_RESIZE_NAME = "resizeFrame";

    function onClientSettingsPush(entry) {
        if(context.clientSettingsModel.items[fjs.controllers.MainController.IS_WARNING_SHOWN]) {
            $scope.isWarningsShown = context.clientSettingsModel.items[fjs.controllers.MainController.IS_WARNING_SHOWN].value;
            context.safeApply($scope);
        }
    }

    $scope.isConnected = true;
    $scope.warningsTemplatePath = "templates/warnings.html";
    $scope.isWarningsShown = false;
    $scope.loggined = true;
    $scope.connection = true;
    $scope.phone = true;
    $scope.isLocationRegistered = true;

    var initResizeFrame = function() {
        var messageH = {};
        messageH.action = "setSoftphoneHeight";
        messageH.data = {};
        messageH.data.height = context.SOFTPHONE_HEIGHT;
        sfApiProvider.sendAction(messageH);

        var messageW = {};
        messageW.action = "setSoftphoneWidth";
        messageW.data = {};
        messageW.data.height = context.SOFTPHONE_WIDTH;
        sfApiProvider.sendAction(messageW);

        var frameHtml = document.getElementById(context.FRAME_RESIZE_NAME);
        var oldHeight = frameHtml.clientHeight;
        var timerResize = null;

        document.body.onresize = function(){
            onResize();
        };

        function onResize() {
            if(timerResize!=null) {
                clearTimeout(timerResize);
                timerResize = null;
            }
            timerResize=setTimeout( function(){
                var height = frameHtml.clientHeight;
                if(height!=oldHeight) {
                    var message = {};
                    message.action = "setSoftphoneHeight";
                    message.data = {};
                    message.data.height = frameHtml.clientHeight;
                    message.callback = function(res){
                        timerResize = null;
                    };
                    sfApiProvider.sendAction(message);
                }
                oldHeight = height;
            }, 100);
        }

        setTimeout(function(){
            frame.onresize = function(){
                onResize();
            }
        },200);
    };

    initResizeFrame();

    $scope.showWarnings = function() {
        $scope.isWarningsShown = true;
        context.safeApply($scope);
        dataManager.sendAction(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL , "push", {"xpid": fjs.controllers.MainController.IS_WARNING_SHOWN, "value":  $scope.isWarningsShown});
    };

    $scope.hideWarnings = function() {
        $scope.isWarningsShown = false;
        context.safeApply($scope);
        dataManager.sendAction(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL , "push", {"xpid": fjs.controllers.MainController.IS_WARNING_SHOWN, "value":  $scope.isWarningsShown});
    };

    $scope.toggleWarnings = function() {
        if($scope.isWarningsShown) {
            $scope.hideWarnings();
        }
        else {
            $scope.showWarnings();
        }
    };

    var checkShowWarning = function() {
        $scope.isWarningsButtonShown = !$scope.loggined || !$scope.connection || ! $scope.isLocationRegistered;
        if($scope.loggined && $scope.connection && $scope.isLocationRegistered) {
            $scope.isWarningsShown = false;
        }
        context.safeApply($scope);
    };

    this.meListener = function(entry){
        var name = context.meModel.getProperty("display_name");
        $scope.name = name ? ("User: " + name) : "";
        var ext = context.meModel.getProperty("primary_extension");
        $scope.extension = ext ? ("Extension: x" + ext) : "";
        context.safeApply($scope);
    };

    this.authorizationWarningListener = function(data) {
        $scope.loggined = data;
        checkShowWarning();
        $scope.isConnected = ($scope.connection && $scope.loggined);
        context.safeApply($scope);
    };

    this.connectionWarningListener = function(data) {
        // Add timeout, task #36371 SFA: Warning icon shows up every time I click on anything on Salesforce
        setTimeout(function() {
            $scope.connection = data;
            checkShowWarning();
            $scope.isConnected = ($scope.connection && $scope.loggined);
            context.safeApply($scope);
        }, 1000);
    };

    $scope.$on('onLocationStatus', function(event, key) {
        $scope.isLocationRegistered = key;
        checkShowWarning();
        context.safeApply($scope);
    });

    $scope.$on("$destroy", function() {
        context.meModel.removeEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, context.meListener);
        dataManager.removeWarningListener(fjs.controllers.CommonController.AUTHORIZATION_LISTENER, context.authorizationWarningListener);
        dataManager.removeWarningListener(fjs.controllers.CommonController.CONNECTION_LISTENER, context.connectionWarningListener);
    });

    this.meModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.meListener);

    dataManager.addWarningListener(fjs.controllers.MainController.AUTHORIZATION_LISTENER, this.authorizationWarningListener);
    dataManager.addWarningListener(fjs.controllers.MainController.CONNECTION_LISTENER, this.connectionWarningListener);

    checkShowWarning();
};

fjs.controllers.MainController.CONNECTION_LISTENER = "Connection";
fjs.controllers.MainController.AUTHORIZATION_LISTENER = "Authorization";
fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL = "clientsettings";
fjs.controllers.MainController.IS_WARNING_SHOWN = "isWarningsShown";

fjs.controllers.MainController.extend(fjs.controllers.CommonController);namespace("fjs.controllers");

fjs.controllers.NewCallController = function($scope, $element, dataManager) {
    $scope.phone ="";

    var dialpadPlate = document.getElementById("plate");
    dialpadPlate.onclick = function(e) {
        $scope.$apply(function() {
            $scope.closeDialpad();
        });
    };

    $scope.actionCall = function(phone) {
        dataManager.sendAction(fjs.model.MeModel.NAME, "callTo", {"phoneNumber":phone});
        $scope.phone = "";
        $scope.closeDialpad();
    };

    $scope.showDialpad = function() {
        if($scope.dialogPath) {
            $scope.closeDialpad();
        }
        else {
            $scope.dialogPath = "templates/dialpad.html";
            dialpadPlate.style.display = "block";
            focusPhoneInput();
        }
    };

    $scope.closeDialpad = function() {
         $scope.dialogPath=null;
        dialpadPlate.style.display = "none";
    };

    $scope.$on('onDilapadKey', function(event, key) {
        $scope.phone+=key;
        focusPhoneInput();
    });

    var focusPhoneInput = function() {
        var input = document.getElementById("inputPhone");
        input.focus();
    }
};namespace("fjs.controllers");
fjs.controllers.TransferDialog = function($scope) {
    $scope.transfer_phone = "";
    $scope.dialpadPath = "templates/dialpad.html";

    $scope.$on('onDilapadKey', function(event, key) {
        $scope.transfer_phone+=key;
        var input = document.getElementById("inputTransfer");
        input.focus();
    });

    $scope.transfer = function() {
        $scope.$emit("transfer", $scope.transfer_phone);
    };
};namespace("fjs.controllers");
fjs.controllers.WarningsController = function($scope, $element, dataManager) {
    fjs.controllers.CommonController(this);
    this.me = dataManager.getModel(fjs.model.MeModel.NAME);
    this.locations = dataManager.getModel('locations');
    var context = this;

    this.completeMeListener = function(){
        $scope.name = context.me.getProperty("display_name");
        $scope.fdp_version = context.me.getProperty("fdp_version");
        $scope.my_jid = context.me.getProperty("my_jid");
        $scope.extension = context.me.getProperty("primary_extension");
        $scope.locationId = context.me.getProperty("current_location");
        if(context.locations.items && context.locations.items[$scope.locationId]) {
            $scope.location =  context.locations.items[$scope.locationId].shortName;
            var location = context.locations.items[$scope.locationId];
            if(location){
                setLocationStatus(location);
            }
        }
        context.safeApply($scope);
    };

    this.locationListener = function(){
        if(context.locations.items && context.locations.items[$scope.locationId]) {
            var loc = context.locations.items[$scope.locationId];
            $scope.location = loc.shortName;
            setLocationStatus(loc);
            context.safeApply($scope);
        }
    };

    this.me.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeMeListener);
    this.locations.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.locationListener);

    var setLocationStatus =  function(location) {
        if(location && location.locationType == fjs.controllers.WarningsController.CARRIER_TYPE) {
            $scope.locationState = fjs.controllers.WarningsController.REGISTERED;
            $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, true);
        }
        else {
            if(location.location_status_deviceStatus == "r") {
                $scope.locationState = fjs.controllers.WarningsController.REGISTERED;
                $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, true);
            }
            else {
                $scope.locationState = fjs.controllers.WarningsController.UNREGISTERED;
                $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, false);
            }
        }
    };

    $scope.sendFeedback = function(msg) {
        var description = "";
        description += "Jid: " + $scope.my_jid;
        description += "; Name: " + $scope.name;
        description += "; Extension: " + $scope.extension;
        description += "; License: " + $scope.license;
        description += "; FDP version: " + $scope.fdp_version;
        if($scope.msg && $scope.msg.length != 0) {
            description += "; Message: " + $scope.msg + ".";
        }
        else {
            description += ";"
        }

        var data = {};
        data["description"] = description;
        data["date"] = (new Date()).getTime();
        data["email"] = "";
        data["taskId"] = "-1_-1";
        dataManager.sendAction(fjs.model.MeModel.NAME, "feedback", data);
        $scope.close();
    };

    $scope.close = function() {
        $scope.hideWarnings();
    };

    $scope.$on("$destroy", function() {
        context.me.removeEventListener(fjs.controllers.CommonController.PUSH_LISTENER, context.pushMeListener);
        context.locations.removeEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, context.locationListener);
    });
};

fjs.controllers.WarningsController.extend(fjs.controllers.CommonController);

fjs.controllers.WarningsController.REGISTERED = "Registered";
fjs.controllers.WarningsController.UNREGISTERED = "Unregistered";

fjs.controllers.WarningsController.CARRIER_TYPE = "m";
fjs.controllers.WarningsController.ON_LOCATION_STATUS = "onLocationStatus";
namespace("fjs.controllers");
fjs.controllers.DialpadController = function($scope) {
    $scope.clickDialpad = function(key){
        $scope.$emit("onDilapadKey", key);
    };
};'use strict';

var ng_app = angular.module('SFAdapter', ['SFA_model', 'SF_API']);

ng_app.controller("NewCallController", ['$scope', '$element', 'DataManager', fjs.controllers.NewCallController]);
ng_app.controller("CallsListController", ['$scope', 'DataManager', fjs.controllers.CallsListController]);
ng_app.controller("CallController", ['$scope', '$element', '$timeout', '$filter', '$sce', 'DataManager', 'SFApi', fjs.controllers.CallController]);
ng_app.controller("DialpadController", ['$scope', fjs.controllers.DialpadController]);
ng_app.controller("TransferDialog", ['$scope', fjs.controllers.TransferDialog]);
ng_app.controller("WarningsController", ['$scope', '$element', 'DataManager', fjs.controllers.WarningsController]);
ng_app.controller("MainController", ['$scope', 'DataManager', 'SFApi', fjs.controllers.MainController]);