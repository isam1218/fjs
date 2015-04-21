hudweb.controller('CallCenterMyStatusController', ['$scope', '$rootScope', 'HttpService', function($scope, $rootScope, httpService) {
	$scope.mystatus = this;
	$scope.mystatus.logoutReason = '';
	$scope.checkboxes = {};
	$scope.disableLogout = true;
	$scope.disableLogin = true;
	$scope.reasons = [];
	
	httpService.getFeed('queues');
	httpService.getFeed('queuelogoutreasons');
	
	$scope.$on('queuelogoutreasons_synced', function(event, data) {
		$scope.reasons = data;
	});
	
	// enable/disable action buttons
	$scope.$watch('checkboxes', function() {
		$scope.disableLogin = true;
		$scope.disableLogout = true;
		
		for (xpid in $scope.checkboxes) {
			if ($scope.checkboxes[xpid]) {
				for (i = 0; i < $scope.queues.length; i++) {
					if ($scope.queues[i].xpid == xpid) {
						if ($scope.queues[i].me.status.status == 'login')
							$scope.disableLogout = false;
						else if ($scope.queues[i].me.status.status == 'logout')
							$scope.disableLogin = false;
					}
				}
			}
		}
	}, true);
	
	$scope.selectQueues = function(value) {
		for (i in $scope.checkboxes) {
			if (value == 'all')
				$scope.checkboxes[i] = true;
			else
				$scope.checkboxes[i] = false;
		}
	};
	
	$scope.loginQueues = function(login) {
		var toSend = [];
		
		// find selected queues
		for (i in $scope.checkboxes) {
			if ($scope.checkboxes[i])
				toSend.push(i);
			
			$scope.checkboxes[i] = false;
		}
		
		if (toSend.length > 0) {
			httpService.sendAction('queues', login ? 'queueLogin' : 'queueLogout', {
				contactId: $rootScope.myPid,
				queues: toSend.join(','),
				reason: $scope.mystatus.logoutReason.xpid
			});
		}
			
		$scope.mystatus.logoutReason = '';
	};
	
	$scope.$on("$destroy", function () {
	
	});
}]);
