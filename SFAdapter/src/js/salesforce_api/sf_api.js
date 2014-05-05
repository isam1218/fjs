/**
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
            console.error('Wrong arguments for adding call log.')
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
    console.log("!!!!!!!!!  getPhoneInfo");
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
    console.log("!!!!!!!!!  getLoginInfo");
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




