namespace("fjs.ui");
/**
 * @param $scope
 * @constructor
 * @extends fjs.ui.Controller
 */
fjs.ui.TestWidget = function($scope) {
    fjs.ui.Controller.call(this, $scope);

};
fjs.ui.TestWidget.extend(fjs.ui.Controller);