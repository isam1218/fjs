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
	
	$scope.loginQueues = function(login) {
		var toSend = [];
	
		if(!login)
		{
					var not_selected_options = $('.calllogout option').filter(function(){
						return !$(this).is(':selected');							
					});

                    $(not_selected_options).removeClass('selected');
                    $('.calllogout option:selected').addClass('selected');					
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
