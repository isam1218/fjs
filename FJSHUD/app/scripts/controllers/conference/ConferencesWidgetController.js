hudweb.controller('ConferencesWidgetController', ['$rootScope', '$scope', '$location', 'ConferenceService', 'HttpService', function($rootScope, $scope, $location, conferenceService, httpService) {
	$scope.query = '';
	$scope.totals = {};
	$scope.sortBy = 'location';

  var getXpidInC = $rootScope.$watch('myPid', function(newVal, oldVal){
      if (!$scope.globalXpid){
          $scope.globalXpid = newVal;
              $scope.tab = localStorage['ConfWidget_tab_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConfWidget_tab_of_' + $scope.globalXpid]) : 'my';
              getXpidInC();
      } else {
          getXpidInC();
      }
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

  var serverCount = 0;
  var currentServer;

	conferenceService.getConferences().then(function(data) {
		$scope.conferences = data.conferences;
		$scope.totals = data.totals;
    for (var i = 0; i < data.conferences.length; i++){
      if (currentServer != data.conferences[i].serverNumber){
        serverCount++;
        currentServer = data.conferences[i].serverNumber;
      }
    }
    if (serverCount > 1){
      $scope.sort_options = [
        {display_name: $scope.verbage.sort_room_by_location, type: 'location'}, 
        {display_name: $scope.verbage.sort_by_room_number, type: 'roomNumber'}, 
        {display_name: $scope.verbage.sort_by_activity, type: '-members.length'}
      ];
    } else {
      $scope.sort_options = [
        {display_name: $scope.verbage.sort_by_room_number, type: 'roomNumber'}, 
        {display_name: $scope.verbage.sort_by_activity, type: '-members.length'}
      ];      
    }
	
    $scope.selectedConf = localStorage.selectedConfOption ? JSON.parse(localStorage.selectedConfOption) : $scope.sort_options[0];
  });

  $scope.sortConf = function(selection){
	localStorage.selectedConfOption = JSON.stringify(selection);
    $scope.selectedConf = selection;
  };

	$scope.enableChat = true;
	
	// filter list down
	$scope.customFilter = function() {
		return function(conference) {
      if (($scope.tab == 'all'  && conference.permissions == 0)|| ($scope.tab == 'my' && conference.permissions == 0)){
				if (conference.members.length == 0){
					if ($scope.query == '' || conference.extensionNumber.indexOf($scope.query) != -1)
						return true;
				} else {
					for (var j = 0; j < conference.members.length; j++){
						var individualMember = conference.members[j];
						if (individualMember.displayName.toLowerCase().indexOf($scope.query.toLowerCase()) != -1 || individualMember.fullProfile.primaryExtension.indexOf($scope.query) != -1 || conference.extensionNumber.indexOf($scope.query) != -1)
							return true;
					}
				}
			}
		};
	};
	
	$scope.findRoom = function() {	
		var found = null;
		
		// find first empty room on same server
		for (var i = 0; i < $scope.conferences.length; i++) {
			if ($scope.conferences[i].serverNumber.indexOf($rootScope.meModel.server_id) != -1 && (!$scope.conferences[i].members || $scope.conferences[i].members.length == 0) && $scope.conferences[i].permissions == 0) {
				found = $scope.conferences[i].xpid;
				break;
			}
		}
		
		// try again for linked server
		if (!found) {
			for (var i = 0; i < $scope.conferences.length; i++) {
				// find first room on same server
				if (!$scope.conferences[i].members || $scope.conferences[i].members.length == 0 && $scope.conferences[i].permissions == 0) {
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

  $scope.addToConference = function(){
    console.error('called! w. ng-model as - ', $scope.conferenceContact);
    params = {
      conferenceD: $scope.conferenceId,
      phone: $scope.conferenceContact
    }
    httpService.sendAction("conferences", "joinPhone", params);
  };


	$scope.$on('calls_updated',function(event,data){
		if(data){
			$scope.calls = data;
			$scope.currentCall = $scope.calls[Object.keys($scope.calls)[0]];
		}
		$scope.inCall = Object.keys($scope.calls).length > 0;
	});
}]);