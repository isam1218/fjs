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
