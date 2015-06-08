hudweb.controller('CallLogController', ['$scope', '$routeParams', 'HttpService', 'ContactService', 'QueueService', 'GroupService', 'ConferenceService', 'PhoneService', 'SettingsService', '$timeout',
	function($scope, $routeParams, httpService, contactService, queueService, groupService, conferenceService, phoneService, settingsService, $timeout) {	
	$scope.calllog = this;
	$scope.calllog.query = '';
	$scope.calls = [];
	$scope.sortField = "startedAt";
	$scope.sortReverse = true;
	$scope.loading = true;
	
	var pageFilter = '';
	var feed;
	
	// limit results on other widgets
	if ($routeParams.queueId) {
		pageFilter = $routeParams.queueId;
		feed = 'queues';
	}
	else if ($routeParams.contactId) {
		pageFilter = $routeParams.contactId;
		feed = 'contacts';
	}
	
	if (pageFilter != '') {
		httpService.getCallLog(feed, pageFilter).then(function(data) {
			updateCallLog(data.items);
		});
	}
  
  httpService.getFeed('settings');
	
	settingsService.getSettings().then(function(data){
		$scope.logSize = data['recent_call_history_length'] || 100; 
	});

  $scope.$on('settings_updated', function(event, data){
      if (data['hudmw_searchautoclear'] == ''){
          autoClearOn = false;
          if (autoClearOn && $scope.calllog.query != ''){
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
          if (autoClearOn && $scope.calllog.query != ''){
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
              $scope.calllog.query = '';
          }, timeParsed);         
      } else if (!autoClearTime){
          return;
      }
  };

	// wait for sync before polling updates
	queueService.getQueues().then(function() {
		if (pageFilter == '')
			httpService.getFeed('calllog');

		$scope.$on('calllog_synced', function(event, data) {
			updateCallLog(data);
		});
	});
	
	var updateCallLog = function(data) {
		for (var i = 0, iLen = data.length; i < iLen; i++) {
			var match = false;
			
			for (var c = 0, cLen = $scope.calls.length; c < cLen; c++) {
				// find existing (and maybe delete)
				if ($scope.calls[c].xpid == data[i].xpid) {
					if (data[i].xef001type == 'delete') {
						$scope.calls.splice(c, 1);
						cLen--;
					}
					
					match = true;
					break;
				}
			}
			
			// add new (if it also meets page type)
			if (!match && data[i].xef001type != 'delete' && 
				(pageFilter == '' || ((data[i].queueId !== undefined && pageFilter == data[i].queueId) || (data[i].contactId !== undefined && pageFilter == data[i].contactId)))) {
					
				$scope.calls.push(data[i]);
				
				// add contextual menu info
				if (data[i].queueId !== undefined)
					$scope.calls[$scope.calls.length-1].fullProfile = queueService.getQueue(data[i].queueId);
				else if (data[i].departmentId !== undefined)
					$scope.calls[$scope.calls.length-1].fullProfile = groupService.getGroup(data[i].departmentId);
				else if (data[i].conferenceId !== undefined)
					$scope.calls[$scope.calls.length-1].fullProfile = conferenceService.getConference(data[i].conferenceId);
				else if (data[i].contactId !== undefined)
					$scope.calls[$scope.calls.length-1].fullProfile = contactService.getContact(data[i].contactId);
			}
		}
			
		$scope.loading = false;
	};
	
	$scope.customFilter = function() {
		var query = $scope.calllog.query.toLowerCase();
		
		return function(call) {
			if (query == '' || call.displayName.toLowerCase().indexOf(query) != -1 || call.phone.indexOf(query) != -1)
				return true;
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