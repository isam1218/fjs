/**
 * Created by vovchuk on 11/6/13.
 */fjs.core.namespace("fjs.ui");

fjs.ui.ContextMenuController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var extensionObject = document.getElementById("extensionObject");
    var sendMessage = function(message) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent("FonExtensionEvent", true, true, message);
        this.extensionObject.dispatchEvent(event);
    }
    $scope.unpin = function(contact) {
        sendMessage({"action":"runApp", "url":"contact/"+contact.xpid});
    };
}

fjs.core.inherits(fjs.ui.ContextMenuController, fjs.ui.Controller)