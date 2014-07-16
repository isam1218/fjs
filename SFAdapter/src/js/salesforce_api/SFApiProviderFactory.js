/**
 * Created by ddyachenko on 23.04.2014.
 */
namespace("fjs.sf");

fjs.sf.SFApiProviderFactory = function() {
    this._providers = {
        'simple': fjs.sf.SFSimpleProvider
    };
};

fjs.sf.SFApiProviderFactory.prototype.getProvider = function() {
    return new fjs.sf.SFSimpleProvider();
};