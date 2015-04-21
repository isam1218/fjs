hudweb.controller('CallLogController', ['$scope', '$routeParams', 'HttpService', 'ContactService', 'QueueService', 'GroupService', 'ConferenceService', function($scope, $routeParams, httpService, contactService, queueService, groupService, conferenceService) {	
	$scope.calllog = this;
	$scope.calllog.query = '';
	$scope.calls = [];
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
  var Months = ['January','February','March','April','May','June','July','August','October','September','November','December'];
	
	var pageFilter = '';
	
	// limit results on other widgets
	if ($routeParams.queueId)
		pageFilter = $routeParams.queueId;
	else if ($routeParams.contactId)
		pageFilter = $routeParams.contactId;
	
	// wait for sync
	queueService.getQueues().then(function() {
		httpService.getFeed('calllog');

		$scope.$on('calllog_synced', function(event, data) {			
			angular.forEach(data, function(obj) {
				var match = false;
				
				for (i = 0; i < $scope.calls.length; i++) {
					// update or delete
					if ($scope.calls[i].xpid == obj.xpid) {
						if (obj.xef001type == 'delete')
							$scope.calls.splice(i, 1);
						
						match = true;
						break;
					}
				}
				
				// add new
				if (!match) {
					$scope.calls.push(obj);
					
					// add contextual menu info
					if (obj.contactId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = contactService.getContact(obj.contactId);
					else if (obj.queueId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = queueService.getQueue(obj.queueId);
					else if (obj.departmentId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = groupService.getGroup(obj.departmentId);
					else if (obj.conferenceId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = conferenceService.getConference(obj.conferenceId);
				}
			});
		});
	});
	
	$scope.customFilter = function() {
		var query = $scope.calllog.query.toLowerCase();
		
		return function(call) {
			if (pageFilter == '' || (call.fullProfile && call.fullProfile.xpid == pageFilter)) {
				if (query == '' || call.displayName.toLowerCase().indexOf(query) != -1 || call.phone.indexOf(query) != -1)
					return true;
			}
		};
	};

    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverse = false;
        }
        else {
            $scope.sortReverse = !$scope.sortReverse;
        }
    };
	
	$scope.makeCall = function(number) {
		httpService.sendAction('me', 'callTo', {phoneNumber: number});
	};

	$scope.formatDate = function(call){
		var date = new Date(call.startedAt);
		var today = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		var dateString = "";
		dateString = Months[date.getMonth()] + " " + date.getDate() + ", " + strTime;

		if (date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()){
			if (date.getDate() == today.getDate()){
				dateString = "Today" + ", " + strTime;
			} else if (date.getDate() == today.getDate() - 1){
				dateString = "Yesterday" + ", " + strTime;
			} 
		}

		return dateString;
	};

}]);