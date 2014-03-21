(function(){
    /**
     * @param {string} ticket
     * @param {string} node
     * @param {string} url
     * @constructor
     * @extends fjs.fdp.FDPTransport
     */
    fjs.fdp.WebSocketsTransport = function(ticket, node, url) {
        fjs.fdp.FDPTransport.call(this, ticket, node, url);
    };
    fjs.fdp.WebSocketsTransport.extend(fjs.fdp.FDPTransport);
})();