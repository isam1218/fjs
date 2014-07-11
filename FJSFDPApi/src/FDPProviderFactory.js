namespace("fjs.api");
/**
 * Provider factory decides which provider to create.
 * It analyze browser capabilities and selects the most suitable provider (SharedWorkerProvider, WebWorkerProvider, SimpleProvider...).
 * @constructor
 */
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
 * Returns most suitable provider
 * @param {string} ticket - authorization ticket
 * @param {string?} node - node ID
 * @param {Function} callback - method to execute when API and FJSFDP fully initialized
 * @returns {fjs.api.DataProviderBase|undefined}
 */
fjs.api.FDPProviderFactory.prototype.getProvider = function(ticket, node, callback) {
    for(var i=0; i<fjs.fdp.CONFIG.providers.length; i++) {
        var provider = this._providers[fjs.fdp.CONFIG.providers[i]];
        if(provider.check()) {
            return new provider(ticket, node, callback);
        }
    }
};