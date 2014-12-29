fjs.core.namespace("fjs.directive");
fjs.directive.Unpin = function() {
    return function($scope,$element,$attrs){
        var el = $element[0];
        el.ondragend = function(e) {
			//window.open('popup.html#' + $attrs.unpin, $attrs.unpin, "scrollbars=yes, status=no, titlebar=no, toolbar=no, location=no, menubar=no, width=400, height=600");
        };

    }
};