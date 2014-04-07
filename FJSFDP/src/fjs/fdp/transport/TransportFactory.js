(function(){

    /**
     *
     * @constructor
     */
    fjs.fdp.transport.TransportFactory = function() {

    };
    /**
     * @param {string} ticket
     * @param {string} node
     * @param {string} url
     * @returns {fjs.fdp.transport.FDPTransport}
     * @static
     */
    fjs.fdp.transport.TransportFactory.getTransport = function(ticket, node, url) {
        var is_main;
        if(!fjs.fdp.TabsSynchronizer.useLocalStorageSyncronization()) {
            return new fjs.fdp.transport.XHRTransport(ticket, node, url);
        }
        else {
            is_main = new fjs.fdp.TabsSynchronizer().isMaster;
        }
        if(is_main!=null) {
            if(!is_main) {
                return new fjs.fdp.transport.LocalStorageTransport();
            }
            else {
                this._getBrowserSpecifiedTransport(ticket, node, url);
            }
        }
        return this._getBrowserSpecifiedTransport(ticket, node, url);
    };
    /**
     * @private
     * @returns {fjs.fdp.transport.FDPTransport}
     */
    fjs.fdp.transport.TransportFactory._getBrowserSpecifiedTransport = function(ticket, node, url) {
        if(fjs.utils.Browser.isIE() && fjs.utils.Browser.getIEVersion() < 10) {
            return new fjs.fdp.transport.XDRTransport(ticket, node, url);
        }
        else {
            return new fjs.fdp.transport.XHRTransport(ticket, node, url);
        }
    };
})();