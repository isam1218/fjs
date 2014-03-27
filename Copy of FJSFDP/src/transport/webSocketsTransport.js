(function(){
    /**
     * FDPTransport based on WebSockets
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @constructor
     * @extends fjs.fdp.FDPTransport
     */
    fjs.fdp.WebSocketsTransport = function(ticket, node, url) {
        fjs.fdp.FDPTransport.call(this, ticket, node, url);
    };
    fjs.fdp.WebSocketsTransport.extend(fjs.fdp.FDPTransport);
})();