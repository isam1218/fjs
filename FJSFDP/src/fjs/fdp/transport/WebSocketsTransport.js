(function(){
    /**
     * FDPTransport based on WebSockets
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @constructor
     * @extends fjs.fdp.transport.FDPTransport
     */
    fjs.fdp.transport.WebSocketsTransport = function(ticket, node, url) {
        fjs.fdp.transport.FDPTransport.call(this, ticket, node, url);
    };
    fjs.fdp.transport.WebSocketsTransport.extend(fjs.fdp.transport.FDPTransport);
})();