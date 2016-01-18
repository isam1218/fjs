hudweb.directive('loginAttempt', function() {
	return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            this.attempted = false;

            this.setAttempted = function() {
                this.attempted = true;
            };
        }],
        compile: function(cElement, cAttributes, transclude) {
            return {
                pre: function(scope, formElement, attributes, attemptController) {
                    scope.rc = scope.rc || {};
                    scope.rc[attributes.name] = attemptController;
                },
                post: function(scope, formElement, attributes, attemptController) {
                    formElement.bind('submit', function (event) {
                        attemptController.setAttempted();
                        if (!scope.$$phase) scope.$apply();
                    });
                }
            };
        }
    };
});