namespace("fjs.api");
/**
 *
 * @constructor
 * @extends fjs.api.DataProviderBase
 */
fjs.api.ExtensionProvider = function(ticket, node, config) {
    var context = this;

    fjs.api.DataProviderBase.call(this, ticket, node, config);

    this.extensionObject = document.getElementById("extensionObject");

    this.listeners = {};

    document.addEventListener('PluginExtensionEvent', function(e){
        var data = e.detail;
        context.fireEvent(data.action, data.data);
    }, false, true);
};



fjs.api.ExtensionProvider.prototype.sendMessage = function(message) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("FonExtensionEvent", true, true, message);
    this.extensionObject.dispatchEvent(event);
}

fjs.api.ExtensionProvider.prototype.addListener = function(eventType, listener) {
    if(!this.listeners[eventType]) {
        this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
};

fjs.api.ExtensionProvider.prototype.removeListener = function(eventType, listener) {
    if(this.listeners[eventType]) {
        var index = this.listeners[eventType].indexOf(listener);
        if(index>=0) {
            this.listeners[eventType].splice(index, 1);
        }
    }
};

fjs.fdp.ExtensionProvider.prototype.fireEvent = function(eventType, data) {
    if(this.listeners[eventType]) {
        for(var i=0; i<this.listeners[eventType].length; i++) {
            this.listeners[eventType][i](data);
        }
    }
};
