hudweb.controller('QueueWidgetCallsController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'ContactService', 'QueueService', 'SettingsService', '$timeout', 'NtpService', function($scope, $rootScope, $routeParams, httpService, contactService, queueService, settingsService, $timeout, ntpService) {
	$scope.queueId = $routeParams.queueId;
  $scope.que = {};
  $scope.que.query = '';
	
	$scope.callsWaiting = 0;
	$scope.callsActive = 0;
	$scope.longestWait = 0;
	$scope.longestActive = 0;
	$scope.showWaiting = true;
	$scope.showActive = true;
	
	$scope.filterActive = function(active) {
		return function(call) {
			if (active && call.taken)
				return true;
			else if (!active && !call.taken)
				return true;
		}
	};
	
	// listen for updates
	$scope.$watch('queue.calls', function() {
		$scope.callsWaiting = 0;
		$scope.callsActive = 0;
    var offset = ntpService.fixTime();
		$scope.longestWait = new Date(offset).getTime();
		$scope.longestActive = new Date(offset).getTime();
		
		for (var i = 0; i < $scope.queue.calls.length; i++) {
			// active calls
			if ($scope.queue.calls[i].taken) {
				$scope.callsActive++;
				
				// find longest				
				if ($scope.queue.calls[i].startedAt < $scope.longestActive)
					$scope.longestActive = $scope.queue.calls[i].startedAt;
			}
			// waiting
			else {
				$scope.callsWaiting++;
						
				// find longest				
				if ($scope.queue.calls[i].startedAt < $scope.longestWait)
					$scope.longestWait = $scope.queue.calls[i].startedAt;
			}
		}
	}, true);

  httpService.getFeed('settings');

  $scope.$on('settings_updated', function(event, data){
      if (data['hudmw_searchautoclear'] == ''){
          autoClearOn = false;
          if (autoClearOn && $scope.que.query != ''){
                  $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                  $scope.clearSearch($scope.autoClearTime);          
              } else if (autoClearOn){
                  $scope.autoClearTime = data['hudmw_searchautocleardelay'];
              } else if (!autoClearOn){
                  $scope.autoClearTime = undefined;
              }
      }
      else if (data['hudmw_searchautoclear'] == 'true'){
          autoClearOn = true;
          if (autoClearOn && $scope.que.query != ''){
              $scope.autoClearTime = data['hudmw_searchautocleardelay'];
              $scope.clearSearch($scope.autoClearTime);          
          } else if (autoClearOn){
              $scope.autoClearTime = data['hudmw_searchautocleardelay'];
          } else if (!autoClearOn){
              $scope.autoClearTime = undefined;
          }
      }        
  });

  var currentTimer = 0;

  $scope.clearSearch = function(autoClearTime){
      if (autoClearTime){
          var timeParsed = parseInt(autoClearTime + '000');
          $timeout.cancel(currentTimer);
          currentTimer = $timeout(function(){
              $scope.que.query = '';
          }, timeParsed);         
      } else if (!autoClearTime){
          return;
      }
  };
}]);
