hudweb.controller('ConferencesWidgetController', ['$rootScope', '$scope', '$location', 'ConferenceService', 'HttpService', function($rootScope, $scope, $location, conferenceService, httpService) {
	$scope.tab = 'my';
	$scope.query = '';
	$scope.totals = {occupied: 0, talking: 0, all: 0};
	$scope.conferences = conferenceService.getConferences();
	$scope.sortBy = 'location';

	$scope.sort_options = [{display_name: "Sort By Location"}, {display_name: "Sort By Room Number"}, {display_name: "Sort By Activity"}];
	
	$scope.selectedConference = localStorage.conf_option ? JSON.parse(localStorage.conf_option) : $scope.sort_options[1];
	// $scope.selectedConference = $scope.sort_options[1];
	// console.log('upon initial load- 1) LS.conf_option is -  ', localStorage.conf_option);
  // console.log('upon initial load- 2) $scope.selectedConference is - ', $scope.selectedConference);


	$scope.sortedBy = function(selectedConference){
		// console.log('selectedConference passed into sortBy is - ', selectedConference);
		$scope.selectedConference = selectedConference;
		// console.log('*scope.selectedConference after assign - ', $scope.selectedConference);
		localStorage.conf_option = JSON.stringify($scope.selectedConference);
		// console.log('*LS.conf_option is - ', localStorage.conf_option);
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
			if ($scope.tab == 'all' || ($scope.tab == 'my' && conference.permissions == 0)) {
				if ($scope.query == '' || conference.extensionNumber.indexOf($scope.query) != -1){
					return true;
				} else if (conference.members.length){
					for (j = 0; j < conference.members.length; j++){
						var individualMember = conference.members[j];
						if (individualMember.displayName.toLowerCase().indexOf($scope.query.toLowerCase()) != -1){
							return true;
						}
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
			
			/*if(data.length > 0){
				element = document.getElementById("CallAlert");
         		element.style.display="block";
		  		content = element.innerHTML;
       	  		phoneService.displayNotification(content,element.offsetWidth,element.offsetHeight);
          		element.style.display="none";
			}*/

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