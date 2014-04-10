namespace("fjs.controllers");
fjs.controllers.CommonController = function() {
};

fjs.controllers.CommonController.prototype.safeApply = function($scope, fn) {
    var phase = $scope.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
            fn();
        }
    } else {
        $scope.$apply(fn);
    }
};

fjs.controllers.CommonController.COMPLETE_LISTENER = "complete";
fjs.controllers.CommonController.PUSH_LISTENER = "push";
fjs.controllers.CommonController.DELETE_LISTENER = "delete";
