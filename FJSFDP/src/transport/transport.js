(function() {
    namespace("fjs.fdp");
    /**
     * Transport to communicate with FDP server
     * @param {string} ticket
     * @param {string} node
     * @param {string} url
     * @constructor
     * @extends fjs.EventsSource
     * @abstract
     */
    fjs.fdp.FDPTransport = function (ticket, node, url) {
        fjs.EventsSource.call(this);
        /**
         *
         * @type {string}
         */
        this.ticket = ticket;
        /**
         *
         * @type {string}
         */
        this.node = node;
        /**
         *
         * @type {string}
         */
        this.url = url;
    };
    fjs.fdp.FDPTransport.extend(fjs.EventsSource);


    /**
     * @param {Object} message
     * @abstract
     */
    fjs.fdp.FDPTransport.prototype.send = function (message) {

    };

    /**
     * @abstract
     */
    fjs.fdp.FDPTransport.prototype.close = function() {};
})();