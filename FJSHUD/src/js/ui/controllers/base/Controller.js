namespace("fjs.ui");
/**
 * @param $scope
 * @constructor
 */
fjs.ui.Controller = function($scope) {
    $scope.$safeApply = function(fn) {
        var phase = $scope.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            if(fn && (typeof(fn) === 'function')) {
                $scope.$apply(fn);
            }
            else {
                $scope.$apply();
            }
        }
    };
};

/**
 * @param {HTMLElement} target
 * @param {UIEvent} event
 * @returns {*}
 */
fjs.ui.Controller.prototype.getEventHandlerElement = function(target, event) {
      if(target.getAttribute("data-ng-"+event.type)) {
          return target;
      }
      else if(target.parentNode) {
          return this.getEventHandlerElement(target.parentNode, event);
      }
};