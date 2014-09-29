fjs.core.namespace("fjs.directive");
fjs.directive.AvatarMenu = function($parse) {
    var getElementOffset = function(element) {
        if(element != undefined)
        {
            var box = null;
            try {
                box = element.getBoundingClientRect();
            }
            catch(e) {
                box = {top : 0, left: 0, right: 0, bottom: 0};
            }
            var body = document.body;
            var docElem = document.documentElement;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var clientTop = docElem.clientTop || body.clientTop || 0;

            var left = box.left + scrollLeft - clientLeft;
            var top = box.top +  scrollTop - clientTop;
            return {x:left, y:top};
        }
    };
    return function($scope, $element, $attrs){
        var el = $element[0];
        el.onclick = function(e) {
            e.stopPropagation();
            e.preventDefault();
            var elOffset = getElementOffset(el);
            $scope.showMenu({key:"contextMenu", x:elOffset.x+el.clientWidth-5, y:elOffset.y+el.clientHeight-5, model: $parse($attrs.avatarMenu)($scope)});
            return false;
        };
    }
};