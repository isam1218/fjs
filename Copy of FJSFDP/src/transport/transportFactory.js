(function(){

    /**
     *
     * @constructor
     * @static
     */
    fjs.fdp.TransportFactory = function() {};
    /**
     * @param {string} ticket
     * @param {string} node
     * @param {string} url
     * @returns {fjs.fdp.FDPTransport}
     */
    fjs.fdp.TransportFactory.getTransport = function(ticket, node, url) {
        var is_main;
        if(!fjs.fdp.TabsSyncronizer.useLocalStorageSyncronization()) {
            return new fjs.fdp.XHRTransport(ticket, node, url);
        }
        else {
            is_main = new fjs.fdp.TabsSyncronizer().isMaster;
        }
        if(is_main!=null) {
            if(!is_main) {
                return new fjs.fdp.LocalStorageTransport();
            }
            else {
                this._getBrowserSpecifiedTransport(ticket, node, url);
            }
        }
        return this._getBrowserSpecifiedTransport(ticket, node, url);
    };
    /**
     * @private
     * @returns {fjs.fdp.FDPTransport}
     */
    fjs.fdp.TransportFactory._getBrowserSpecifiedTransport = function(ticket, node, url) {
        if(fjs.utils.Browser.isIE() && fjs.utils.Browser.getIEVersion() < 10) {
            return new fjs.fdp.XDRTransport(ticket, node, url);
        }
        else {
            return new fjs.fdp.XHRTransport(ticket, node, url);
        }
    };


})();