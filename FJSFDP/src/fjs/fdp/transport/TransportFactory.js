(function(){
    /**
     * FDP Transports factory
     * @constructor
     */
    fjs.fdp.transport.TransportFactory = function() {

    };
    /**
     * Creates most appropriate transport.
     * @param {string} ticket - Auth ticket
     * @param {string} node - Node Id
     * @param {string} url - FDP Server URL
     * @param {string} type - Client type (web | salesforce)
     * @returns {fjs.fdp.transport.FDPTransport}
     * @static
     */
    fjs.fdp.transport.TransportFactory.getTransport = function(ticket, node, url, type) {
        var is_main;
        if(!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization()) {
            return new fjs.fdp.transport.XHRTransport(ticket, node, url, type);
        }
        else {
            is_main = new fjs.tabs.TabsSynchronizer().isMaster;
        }
        if(is_main!=null) {
            if(!is_main) {
                return new fjs.fdp.transport.LocalStorageTransport();
            }
            else {
                this._getBrowserSpecifiedTransport(ticket, node, url, type);
            }
        }
        return this._getBrowserSpecifiedTransport(ticket, node, url, type);
    };
    /**
     * @param {string} ticket - Auth ticket
     * @param {string} node - Node Id
     * @param {string} url - FDP Server URL
     * @param {string} type - Client type (web | salesforce)
     * @returns {fjs.fdp.transport.FDPTransport}
     * @private
     */
    fjs.fdp.transport.TransportFactory._getBrowserSpecifiedTransport = function(ticket, node, url, type) {

        if(fjs.utils.Browser.isIE() && fjs.utils.Browser.getIEVersion() < 10) {
            return new fjs.fdp.transport.XDRTransport(ticket, node, url, type);
        }
        else {
            return new fjs.fdp.transport.XHRTransport(ticket, node, url, type);
        }
    };
    fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization = function() {
        return typeof window !== 'undefined' && window.document !== undefined || (self && self["web_worker"]);
    };
})();
