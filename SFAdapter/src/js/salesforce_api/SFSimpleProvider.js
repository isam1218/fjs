/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");

fjs.sf.SFSimpleProvider = function() {
    if (!fjs.sf.SFSimpleProvider.__instance){
        var tabsSynchronizer = new fjs.fdp.TabsSynchronizer();
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

