namespace("fjs.api");

fjs.api.FDPProviderFactory = function() {
    /**
     * register of providers
     * @enum {Function}
     * @private
     */
    this._providers = {
        'sharedWorker': fjs.api.SharedWorkerDataProvider
        , 'webWorker': fjs.api.WebWorkerDataProvider
        , 'simple': fjs.api.SimpleClientDataProvider
    }
};
/**
 * @param ticket
 * @param node
 * @param callback
 * @returns {fjs.api.ClientDataProviderBase|undefined}
 */
fjs.api.FDPProviderFactory.prototype.getProvider = function(ticket, node, callback) {
    for(var i=0; i<fjs.fdp.CONFIG.providers.length; i++) {
        var provider = this._providers[fjs.fdp.CONFIG.providers[i]];
        if(provider.check()) {
            return new provider(ticket, node, callback);
        }
    }
};