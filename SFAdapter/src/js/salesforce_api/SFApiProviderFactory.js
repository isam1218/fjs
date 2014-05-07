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
//    for(var i=0; i<fjs.fdp.CONFIG.providers.length; i++) {
//        var provider = this._providers[fjs.fdp.CONFIG.providers[i]];
//        if(provider.check()) {
//            return new provider();
//        }
//    }
};