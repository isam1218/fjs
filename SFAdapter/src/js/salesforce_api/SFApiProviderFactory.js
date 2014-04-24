/**
 * Created by ddyachenko on 23.04.2014.
 */

var SFApiProviderFactory = function() {
    if (!SFApiProviderFactory.__instance){
        SFApiProviderFactory.__instance = this;
        this.sfProvider = new SFSimpleProvider();
    }
    else {
        return SFApiProviderFactory.__instance;
    }
};

SFApiProviderFactory.prototype.sendAction = function(actionName, data, callback) {
    this.sfProvider.sendAction(actionName, data, callback);
};