(function() {
    namespace("fjs.fdp.transport");
    /**
     * Transport to communicate with FDP server <br>
     * Base class of all transports. <br>
     * All transports provide a single interface to work with FDP server it can be Ajax, WebSockets or LocalStorage synchronization.
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @constructor
     * @extends fjs.EventsSource
     * @abstract
     */
    fjs.fdp.transport.FDPTransport = function (ticket, node, url) {
        fjs.EventsSource.call(this);
        /**
         * Auth ticket
         * @type {string}
         */
        this.ticket = ticket;
        /**
         * Node ID
         * @type {string}
         */
        this.node = node;
        /**
         * FDP server URL
         * @type {string}
         */
        this.url = url;
    };
    fjs.fdp.transport.FDPTransport.extend(fjs.EventsSource);


    /**
     *  This method provides all actions to works with simple FDP syncronization.
     *  Exist 3 message types:
     *  <ul>
     *      <li>
     *          'action' - sends action to FDP server
     *      </li>
     *      <li>
     *          'synchronize' - starts syncronization for list of feeds
     *      </li>
     *      <li>
     *          'forget' - ends suncronization for feed
     *      </li>
     *  </ul>
     * @param {Object} message - Action message
     * @abstract
     */
    fjs.fdp.transport.FDPTransport.prototype.send = function (message) {

    };

    /**
     * Ends syncronization throws this transport
     * @abstract
     */
    fjs.fdp.transport.FDPTransport.prototype.close = function() {};
})();