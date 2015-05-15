hudweb.controller('ConferencesWidgetController', ['$rootScope', '$scope', '$location', 'ConferenceService', 'HttpService', function($rootScope, $scope, $location, conferenceService, httpService) {
	$scope.query = '';
	$scope.totals = {occupied: 0, talking: 0, all: 0};
	$scope.sortBy = 'location';
	var addedPid;
	var localPid;

  var getXpidInC = $rootScope.$watch('myPid', function(newVal, oldVal){
      if (!$scope.globalXpid){
          $scope.globalXpid = newVal;
              $scope.tab = localStorage['ConfWidget_tab_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConfWidget_tab_of_' + $scope.globalXpid]) : 'my';
              getXpidInC();
      } else {
          getXpidInC();
      }
  });

  $scope.$on('pidAdded', function(event, data){
      $scope.globalXpid = data.info;
      $scope.tab = localStorage['ConfWidget_tab_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConfWidget_tab_of_' + $scope.globalXpid]) : 'my';
  });
	
	$scope.tab = localStorage['ConfWidget_tab_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConfWidget_tab_of_' + $scope.globalXpid]) : 'my';

  $scope.saveCTab = function(tabType){
  	if (tabType === 1){
  		$scope.tab = 'my';
  		localStorage['ConfWidget_tab_of_' + $scope.globalXpid] = JSON.stringify($scope.tab);
  	} else if (tabType === 2){
  		$scope.tab = 'all';
  		localStorage['ConfWidget_tab_of_' + $scope.globalXpid] = JSON.stringify($scope.tab);
  	}
  };

	conferenceService.getConferences().then(function(data) {
		$scope.conferences = data;
	});

	$scope.sort_options = [
		{display_name: $scope.verbage.sort_room_by_location}, 
		{display_name: $scope.verbage.sort_by_room_number}, 
		{display_name: $scope.verbage.sort_by_activity}
	];
	
	$scope.selectedConference = localStorage.conf_option ? JSON.parse(localStorage.conf_option) : $scope.sort_options[1];

	$scope.$on('pidAdded', function(event, data){
		addedPid = data.info;
		if (localStorage['recents_of_' + addedPid] === undefined){
			localStorage['recents_of_' + addedPid] = '{}';
		}
		$scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
	});

	$scope.sortedBy = function(selectedConference){
		localPid = JSON.parse(localStorage.me);
		$scope.selectedConference = selectedConference;
		localStorage.conf_option = JSON.stringify($scope.selectedConference);
	};

	$scope.storeRecentConference = function(confXpid){
		localPid = JSON.parse(localStorage.me);
		$scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
		$scope.recent[confXpid] = {
			type: 'conference',
			time: new Date().getTime()
		};
		localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
		$rootScope.$broadcast('recentAdded', {id: confXpid, type: 'conference', time: new Date().getTime()});
	};

	$scope.enableChat = true;

	// get data from sync
	$scope.$on('conferences_updated', function(event, data) {
		$scope.conferences = data;
		
		// update totals
		$scope.totals = {occupied: 0, talking: 0, all: 0};
		
		for (i = 0; i < $scope.conferences.length; i++) {
			if ($scope.conferences[i].members && $scope.conferences[i].members.length > 0) {
				$scope.totals.occupied++;
				$scope.totals.all += $scope.conferences[i].members.length;
				
				for (m = 0; m < $scope.conferences[i].members.length; m++) {
					if (!$scope.conferences[i].members[m].muted)
						$scope.totals.talking++;
				}
			}
		}
	});
	
	// filter list down
	$scope.customFilter = function() {
		return function(conference) {
			if ($scope.tab == 'all' || ($scope.tab == 'my' && conference.permissions == 0)){
				if (!conference.members){
					if ($scope.query == '' || conference.extensionNumber.indexOf($scope.query) != -1)
						return true;
				} else if (conference.members.length){
					for (var j = 0; j < conference.members.length; j++){
						var individualMember = conference.members[j];
						if (individualMember.displayName.toLowerCase().indexOf($scope.query.toLowerCase()) != -1 || individualMember.fullProfile.primaryExtension.indexOf($scope.query) != -1 || conference.extensionNumber.indexOf($scope.query) != -1)
							return true;
					}
				}
			}
		};
	};
	
	$scope.getSingleAvatarUrl = function(xpid){
    	if(xpid){
    		return httpService.get_avatar(xpid,14,14);
    	}else{
    		return 'img/Generic-Avatar-14.png';
    	}
    };
	
	$scope.findRoom = function() {	
		var found = null;
		
		// find first empty room on same server
		for (i = 0; i < $scope.conferences.length; i++) {
			if ($scope.conferences[i].serverNumber.indexOf($rootScope.meModel.server_id) != -1 && (!$scope.conferences[i].members || $scope.conferences[i].members.length == 0)) {
				found = $scope.conferences[i].xpid;
				break;
			}
		}
		
		// try again for linked server
		if (!found) {
			for (i = 0; i < $scope.conferences.length; i++) {
				// find first room on same server
				if (!$scope.conferences[i].members || $scope.conferences[i].members.length == 0) {
					found = $scope.conferences[i].xpid;
					break;
				}
			}
		}
		
		if (found) {
			httpService.sendAction("conferences", "joinContact", {
				conferenceId: found,
				contactId: $rootScope.myPid,
			});
			
			$location.path('/conference/' + found + '/currentcall');
		}
	};

	$scope.joinConference = function(){

		if($scope.joined){
			params = {
				conferenceId:$scope.targetId
			}
			httpService.sendAction("conferences",'leave',params);
		}else{
				params = {
					conferenceId: $scope.targetId,
					contactId: $scope.meModel.my_pid,
				}

			httpService.sendAction("conferences","joinContact",params);

			
		}
	}

	$scope.$on('calls_updated',function(event,data){
		if(data){
			$scope.calls = data;
			$scope.currentCall = $scope.calls[Object.keys($scope.calls)[0]];
		}
		
		$scope.inCall = Object.keys($scope.calls).length > 0;
	});

    $scope.getAvatarUrl = function(conference, index) {
        if (conference.members) {
            if (conference.members[index] !== undefined) {
                var xpid = conference.members[index].contactId;
                return httpService.get_avatar(xpid,28,28);
            }
            else
                return 'img/Generic-Avatar-28.png';
        }
        else
            return 'img/Generic-Avatar-28.png';
    };
}]);