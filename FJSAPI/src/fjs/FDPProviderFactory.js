fjs.core.namespace("fjs.api");
/**
 * @param {Object} config
 * @constructor
 */
fjs.api.FDPProviderFactory = function(config) {
    this.config = config;
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
 * @returns {fjs.api.DataProviderBase|undefined}
 */
fjs.api.FDPProviderFactory.prototype.getProvider = function(ticket, node, callback) {
    for(var i=0; i<this.config.providers.length; i++) {
        var provider = this._providers[this.config.providers[i]];
        if(provider.check()) {
            return new provider(ticket, node, this.config, callback);
        }
    }
};