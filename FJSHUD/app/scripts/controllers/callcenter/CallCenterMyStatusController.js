hudweb.controller('CallCenterMyStatusController', ['$scope', '$rootScope', 'HttpService', 'QueueService', function($scope, $rootScope, httpService, queueService) {
	$scope.mystatus = this;
	$scope.mystatus.logoutReason = '';
	$scope.checkboxes = {};
	$scope.disableLogout = true;
	$scope.disableLogin = true;
	
	queueService.getQueues().then(function(data) {
		$scope.reasons = data.reasons;
		$scope.queues = data.mine;
	});
	
	// enable/disable action buttons
	$scope.$watchCollection('checkboxes', function() {
		$scope.disableLogin = true;
		$scope.disableLogout = true;
		
		for (var xpid in $scope.checkboxes) {
			if ($scope.checkboxes[xpid]) {
				for (var i = 0; i < $scope.queues.length; i++) {
					if ($scope.queues[i].xpid == xpid) {
						if ($scope.queues[i].me.status.status == 'login')
							$scope.disableLogout = false;
						else if ($scope.queues[i].me.status.status == 'logout')
							$scope.disableLogin = false;
					}
				}
			}
		}
	});
	
	$scope.selectQueues = function(value) {
		for (var i in $scope.checkboxes) {
			if (value == 'all')
				$scope.checkboxes[i] = true;
			else
				$scope.checkboxes[i] = false;
		}
	};
	
	$scope.loginQueues = function(login, event) {
		var toSend = [];
		if(!login)
		{
			var logout_select = event.target;
	    	$(logout_select).find('option').css('background-color', '#fff').css('color', '#333');
	    	var option  = $(logout_select).find('option:selected');
	    	$(option).css('background-color', '#729c00').css('color', '#fff');  
		}
		
		// find selected queues
		for (var i in $scope.checkboxes) {
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
