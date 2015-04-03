hudweb.controller('CallCenterMyStatusController', ['$scope', '$rootScope', 'HttpService', function($scope, $rootScope, httpService) {
	$scope.mystatus = this;
	$scope.mystatus.logoutReason = '';
	$scope.checkboxes = {};
	$scope.disableButtons = true;
	$scope.reasons = [];
	
	httpService.getFeed('queues');
	httpService.getFeed('queuelogoutreasons');
	
	$scope.$on('queuelogoutreasons_synced', function(event, data) {
		$scope.reasons = data;
	});
	
	// attach "me" status
	$scope.$on('queues_updated', function() {
		angular.forEach($scope.queues, function(obj) {
			for (i = 0; i < obj.members.length; i++) {
				if (obj.members[i].contactId == $rootScope.myPid)
					obj.me = obj.members[i];
			}
		});
	});
	
	// enable/disable action buttons
	$scope.$watch('checkboxes', function() {
		for (i in $scope.checkboxes) {
			if ($scope.checkboxes[i]) {
				$scope.disableButtons = false;
				return;
			}
		}
		
		$scope.disableButtons = true;
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
