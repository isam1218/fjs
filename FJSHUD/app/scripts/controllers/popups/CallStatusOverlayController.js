hudweb.controller('CallStatusOverlayController', ['$scope', '$filter', '$timeout', 'HttpService', function($scope, $rootScope, $filter, $timeout, httpService) {
	$scope.timeElapsed = 0;
	$scope.onCall = $scope.$parent.overlay.data;

	var updateTime = function() {
		if ($scope.onCall.call) {
			// format date
			var date = new Date().getTime();
			$scope.timeElapsed = $filter('date')(date - $scope.onCall.call.startedAt, 'mm:ss');
		
			// increment
			if ($scope.$parent.overlay.show)
				$timeout(updateTime, 1000);
		}
		else
			$scope.showOverlay(false);
	};
	
	updateTime();
	
	$scope.bargeCall = function(type, xpid) {
		httpService.sendAction('contacts', type + 'Call', {contactId: xpid});
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
