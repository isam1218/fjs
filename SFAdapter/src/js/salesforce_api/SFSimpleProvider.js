/**
 * Created by ddyachenko on 23.04.2014.
 */

SFSimpleProvider = function() {
    if (!SFSimpleProvider.__instance){
        var tabSync = new fjs.fdp.TabsSynchronizer();
        this.isMaster = tabSync.isMaster;
        this.api = new SFApi();
        SFSimpleProvider.__instance = this;
    }
    else {
        return SFSimpleProvider.__instance;
    }
};

SFSimpleProvider.prototype.sendAction = function(message) {
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
    }
};

