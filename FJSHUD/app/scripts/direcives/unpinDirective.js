fjs.core.namespace("fjs.directive");
fjs.directive.Unpin = function() {
    return function($scope,$element,$attrs){
        var el = $element[0];
        el.ondragend = function(e) {
			/*
            var extensionObject = document.getElementById("extensionObject");
            var sendMessage = function(message) {
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("FonExtensionEvent", true, true, message);
                this.extensionObject.dispatchEvent(event);
            };
            sendMessage({"action":"runApp", "url":$attrs.unpin});
			*/
			
			window.open('popup.html#' + $attrs.unpin, $attrs.unpin, "scrollbars=yes, status=no, titlebar=no, toolbar=no, location=no, menubar=no, width=400, height=600");
        };

    }
};