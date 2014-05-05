/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");

fjs.sf.SFApiProviderFactory = function() {
    if (!fjs.sf.SFApiProviderFactory.__instance){
        fjs.sf.SFApiProviderFactory.__instance = this;
        this.sfProvider = new fjs.sf.SFSimpleProvider();
    }
    else {
        return fjs.sf.SFApiProviderFactory.__instance;
    }
};

fjs.sf.SFApiProviderFactory.prototype.sendAction = function(actionName, data, callback) {
    this.sfProvider.sendAction(actionName, data, callback);
};