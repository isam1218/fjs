hudweb.controller('ConferenceSingleController', ['$scope', 'ConferenceService', 'HttpService', '$routeParams', 'UtilService', 'ContactService', 'PhoneService',
	function($scope,conferenceService,httpService, $routeParams,utilService,contactService,phoneService) {
	$scope.conversationType = 'conference';
	$scope.members = [];
	$scope.conferenceId = $routeParams.conferenceId;

	$scope.enableChat = true;
    $scope.joined = false;
    $scope.conference = conferenceService.getConference($scope.conferenceId);
    	httpService.getFeed("conferencestatus")
	httpService.getFeed("conferencemembers");

	$scope.targetId = $scope.conferenceId;
	$scope.targetAudience = "conference";
	$scope.feed="conferences";
	$scope.targetType = "f.conversation.chat";
	$scope.cTabSelected = "CurrentCall";
	$scope.callrecordings = [];


	$scope.$on("conferences_updated", function(event,data){
   		$scope.conference = conferenceService.getConference($scope.conferenceId);
   		if($scope.conference){
   			if($scope.conference.status){
				$scope.joined = $scope.conference.status.isMeJoined;
    			$scope.enableChat = $scope.joined;
    			$scope.enableFileShare = $scope.joined;
    		}

    		$scope.members = $scope.conference.members;
    		
    		if($scope.conference.callrecordings){
    			$scope.callrecordings = $scope.conference.callrecordings;
    		}
    	}
   	});

   	$scope.searchContact = function(contact){
		if(contact){
			params = {
				conferenceId: $scope.conferenceId,
				contactId: contact.xpid
			}

			httpService.sendAction("conferences","joinContact",params);
		}
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

   	$scope.joinConference = function(){

		if($scope.joined){
			params = {
				conferenceId:$scope.conferenceId
			}
			httpService.sendAction("conferences",'leave',params);
		}else{
				params = {
					conferenceId: $scope.conferenceId,
					contactId: $scope.meModel.my_pid,
				}

			httpService.sendAction("conferences","joinContact",params);

			
		}
	}

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
            minutes = Math.floor(time/60);
            seconds = seconds - (minutes*60);
        }  

        if(minutes < 10){
            minString = "0" + minutes; 
        }
        if(seconds < 10){
            secString = "0" + seconds;  
        }else{
        	secString = seconds;	
        }
        return minString + ":" + secString;

    }

}]);