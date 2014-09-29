fjs.core.namespace("fjs.ui");

fjs.ui.ResentItemController = function($scope, $element) {
    fjs.ui.Controller.call(this, $scope);
    var el = $element[0];
    if(!el.oncontextmenu) {
        el.oncontextmenu = function (e) {
            e.stopPropagation();
            $scope.openMenu(e.clientX, e.clientY);
            return false;
        };
    }
    $scope.avatarClick = function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        $scope.openMenu($event.clientX, $event.clientY);
        return false;
    };
    $scope.openMenu = function(x, y) {
        $scope.$emit("showPopup", {key:"contextMenu", x:x, y:y, model: $scope.resent.getAssociatedEntry()});
    }
};

fjs.core.inherits(fjs.ui.ResentItemController , fjs.ui.Controller);