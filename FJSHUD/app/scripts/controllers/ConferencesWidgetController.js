hudweb.controller('ConferencesWidgetController', ['$scope', '$location', 'ConferenceService', 'HttpService', function($scope, $location, conferenceService, httpService) {
	$scope.tab = 'my';
	$scope.sortBy = 'location';
	$scope.query = '';
	$scope.totals = {occupied: 0, talking: 0, all: 0};
	$scope.conferences = conferenceService.getConferences();
	
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
		
		$scope.$safeApply();
	});
	
	// filter list down
	$scope.customFilter = function() {
		return function(conference) {
			if ($scope.tab == 'all' || ($scope.tab == 'my' && conference.permissions == 0)) {
				if ($scope.query == '' || conference.extensionNumber.indexOf($scope.query) != -1)
					return true;
			}
		};
	};
	
	 $scope.getSingleAvatarUrl = function(xpid){
    	if(xpid){
    		return httpService.get_avatar(xpid,14,14);
    	}else{
    		return 'img/Generic-Avatar-14.png';
    	}
    }
	$scope.findRoom = function() {
		for (i = 0; i < $scope.conferences.length; i++) {
			// find first available room
			if ($scope.conferences[i].members && $scope.conferences[i].members.length == 0) {
				$location.path('/conference/' + $scope.conferences[i].xpid);
				break;
			}
		}
	};

	$scope.$on('calls_updated',function(event,data){
		if(data){
			$scope.calls = data;
			$scope.currentCall = $scope.calls[Object.keys($scope.calls)[0]];
			
			if(data.length > 0){
				element = document.getElementById("CallAlert");
         		element.style.display="block";
		  		content = element.innerHTML;
       	  		phoneService.displayNotification(content,element.offsetWidth,element.offsetHeight);
          		element.style.display="none";

			}

		}
		$scope.inCall = Object.keys($scope.calls).length > 0;
		$scope.$safeApply();
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