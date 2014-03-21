(function(){
    namespace("fjs.fdp");
    /**
     * @constructor
     * @extends fjs.fdp.FDPTransport
     */
    fjs.fdp.LocalStorageTransport = function() {
        var context = this;
        fjs.fdp.FDPTransport.call(this);
        this.onStorage = function(e) {
            if(e.key.indexOf('lsp_')>-1) {
                var eventType = e.key.replace('lsp_', '');
                context.fireEvent(eventType, fjs.utils.JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', this.onStorage, false);
    };
    fjs.fdp.LocalStorageTransport.extend(fjs.fdp.FDPTransport);

    /**
     * @param {Object} message
     */
    fjs.fdp.LocalStorageTransport.prototype.send = function (message) {
        localStorage['lsp_'+message.type] = JSON.stringify(message.data);
    };

    /**
     *
     */
    fjs.fdp.LocalStorageTransport.prototype.close = function() {
        window.removeEventListener('storage', this.onStorage, false);
    };
    fjs.fdp.LocalStorageTransport.masterSend = function(messageType, messageData) {
        localStorage['lsp_'+messageType] = JSON.stringify(messageData);
    };
})();