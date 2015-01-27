fjs.core.namespace("fjs.ui");

fjs.ui.ConferenceWidgetConversationController = function($scope,conferenceService,httpService, $routeParams,utilService) {
	$scope.ConversationType = 'conference';

    $scope.chatDisplay = true;
    $scope.joined = false;
    $scope.cTabSelected = "CurrentCall";
	$scope.conferenceId = $routeParams.conferenceId;
	$scope.enableFileShare = false;
	httpService.getFeed("conferencemembers");
	$scope.members = [];
	$scope.conference = conferenceService.getConference($scope.conferenceId);

	$scope.formate_date = function(time){
        return utilService.formatDate(time,true);
    }

    $scope.formatDuration = function(duration){
        var time =   duration/1000;
        var seconds = time;
        var minutes;
        secString = "00";
        minString = "00";
        if(time >= 60){
            minutes = time/60;
            seconds = seconds - minutes*60;
        }  

        if(minutes < 10){
            minString = "0" + minutes; 
        }
        if(seconds < 10){
            secString = "0" + seconds;  
        }
        return minString + ":" + secString;

    }

    $scope.getAvatarUrl = function(index) {
        if($scope.conference){


	        if($scope.conference.members){
	            if ($scope.conference.members[index] !== undefined) {
	                var xpid = $scope.conference.members[index].contactId;
	                return httpService.get_avatar(xpid,14,14);
	            }
	            else
	                return 'img/Generic-Avatar-14.png';

	        }
    	}
    };
    httpService.getChat('conferences',$scope.conferenceId).then(function(data) {
		version = data.h_ver;
		
		$scope.loading = false;
		$scope.messages = data.items;		
		//$scope.addDetails();
	});
	
	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		$scope.messages = $scope.messages.concat(data);
		//$scope.addDetails();
	});
	
	// apply name and avatar
	/*$scope.addDetails = function() {
		// wait for sync to catch up
		contactService.getContacts().then(function(data) {
			for (i = 0; i < $scope.messages.length; i++) {
				for (key in data) {
					if (data[key].xpid == $scope.messages[i].from.replace('contacts:', '')) {
						$scope.messages[i].avatar = data[key].getAvatar(28);
						$scope.messages[i].displayName = data[key].displayName;
						break;
					}
				}
			}
			
			$scope.$safeApply();
		});
	};*/

    $scope.sendMessage = function() {
		if (this.message == '')
			return;
			
		var data = {
			type: 'f.conversation.chat',
			audience: 'conference',
			to: $scope.conferenceId,
			message: this.message,
		};
		
		myHttpService.sendAction('streamevent', 'sendConversationEvent', data);
		
		this.message = '';
	};

	$scope.$on("conferences_updated", function(event,data){
   		$scope.conference = conferenceService.getConference($scope.conferenceId);
   		if($scope.conference){
   			if($scope.conference.status){
				$scope.joined = $scope.conference.status.isMeJoined;
    			$scope.chatDisplay = $scope.joined;
    			$scope.enableFileShare = $scope.joined;
    		}

    		if($scope.conference.members){
    			$scope.members = $scope.conference.members;
    		}
    		if($scope.conference.callrecordings){
    			$scope.callrecordings = $scope.conference.callrecordings;
    		}
    	}
   	});


} 