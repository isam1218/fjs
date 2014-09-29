fjs.core.namespace("fjs.ui");
/**
 * @param $scope
 * @constructor
 * @extends fjs.ui.Controller
 */
fjs.ui.TestWidget = function($scope) {
    fjs.ui.Controller.call(this, $scope);

};
fjs.core.inherits(fjs.ui.TestWidget, fjs.ui.Controller)