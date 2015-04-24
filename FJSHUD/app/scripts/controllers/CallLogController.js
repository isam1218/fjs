hudweb.controller('CallLogController', ['$scope', '$routeParams', 'HttpService', 'ContactService', 'QueueService', 'GroupService', 'ConferenceService','PhoneService', function($scope, $routeParams, httpService, contactService, queueService, groupService, conferenceService,phoneService) {	
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
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				var match = false;
				
				for (var c = 0, cLen = $scope.calls.length; c < cLen; c++) {
					// update or delete existing
					if ($scope.calls[c].xpid == data[i].xpid) {
						if (data[i].xef001type == 'delete') {
							$scope.calls.splice(c, 1);
							cLen--;
						}
						
						match = true;
						break;
					}
				}
				
				// add new
				if (!match && data[i].xef001type != 'delete') {
					$scope.calls.push(data[i]);
					
					// add contextual menu info
					if (data[i].contactId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = contactService.getContact(data[i].contactId);
					else if (data[i].queueId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = queueService.getQueue(data[i].queueId);
					else if (data[i].departmentId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = groupService.getGroup(data[i].departmentId);
					else if (data[i].conferenceId !== undefined)
						$scope.calls[$scope.calls.length-1].fullProfile = conferenceService.getConference(data[i].conferenceId);
				}
			}
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
		phoneService.makeCall(number);
	};

}]);