fjs.core.namespace("fjs.directive");
fjs.directive.ContextMenu = function($parse) {
    return function($scope,$element,$attrs){
        var el = $element[0];
        el.oncontextmenu = function(e) {
            e.stopPropagation();
            console.time('showPopup');
            $scope.showMenu({key:"contextMenu", x:e.clientX, y:e.clientY, model: $parse($attrs.contextMenu)($scope)});
            console.timeEnd('showPopup');
            return false;
        };
    }
};