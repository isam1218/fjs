(function(){
    namespace("fjs.fdp.transport");
    /**
     * @constructor
     * @extends fjs.fdp.transport.FDPTransport
     */
    fjs.fdp.transport.LocalStorageTransport = function() {
        var context = this;
        fjs.fdp.transport.FDPTransport.call(this);

        this.tabsSynchronizer = new fjs.api.TabsSynchronizer();

        this.onStorage = function(e) {
            if(e.key.indexOf('lsp_')>-1) {
                var eventType = e.key.replace('lsp_', '');
                context.fireEvent(eventType, fjs.utils.JSON.parse(e.newValue));
            }
        };

        if(fjs.utils.Browser.isIE11()) {
            this.tabsSynchronizer.addEventListener('lsp_message', this.onStorage);
            this.tabsSynchronizer.addEventListener('lsp_error', this.onStorage);
            this.tabsSynchronizer.addEventListener('lsp_clientSync', this.onStorage);
            this.tabsSynchronizer.addEventListener('lsp_action', this.onStorage);
        }
        else {
            window.addEventListener('storage', this.onStorage, false);
        }
    };
    fjs.fdp.transport.LocalStorageTransport.extend(fjs.fdp.transport.FDPTransport);

    /**
     *  This method provides all actions to works with simple FDP synchronization.
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
    fjs.fdp.transport.LocalStorageTransport.prototype.send = function (message) {
        if(fjs.utils.Browser.isIE11()) {
            this.tabsSynchronizer.setSyncValue('lsp_'+message.type, fjs.utils.JSON.stringify(message.data));
        }
        else {
            localStorage.setItem('lsp_' + message.type, fjs.utils.JSON.stringify(message.data));
        }
    };

    /**
     *
     */
    fjs.fdp.transport.LocalStorageTransport.prototype.close = function() {
        window.removeEventListener('storage', this.onStorage, false);
        this.tabsSynchronizer.removeEventListener('lsp_message', this.onStorage);
        this.tabsSynchronizer.removeEventListener('lsp_error', this.onStorage);
        this.tabsSynchronizer.removeEventListener('lsp_clientSync', this.onStorage);
        this.tabsSynchronizer.removeEventListener('lsp_action', this.onStorage);
    };
    fjs.fdp.transport.LocalStorageTransport.masterSend = function(messageType, messageData) {
        if(fjs.utils.Browser.isIE11()) {
            new fjs.api.TabsSynchronizer().setSyncValue('lsp_'+messageType, fjs.utils.JSON.stringify(messageData));
        }
        localStorage.setItem('lsp_'+messageType, fjs.utils.JSON.stringify(messageData));
    };
})();