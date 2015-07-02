hudweb.controller('ConferenceSingleController', ['$scope', '$rootScope', 'ConferenceService', 'HttpService', '$routeParams', 'SettingsService', 'StorageService',
	function($scope, $rootScope, conferenceService, httpService, $routeParams, settingsService, storageService) {
	$scope.conversationType = 'conference';
	
	$scope.conferenceId = $routeParams.conferenceId;
	$scope.conference = conferenceService.getConference($scope.conferenceId);

  $scope.membersRefused = [];
	
  $scope.joined = $scope.conference.status.isMeJoined;
    $scope.enableChat = $scope.joined;
    $scope.enableTextInput = $scope.joined;
    $scope.enableFileShare = $scope.joined;
	
   var currentMembers = angular.copy($scope.conference.members);
  
   //its not receiving consistent data from the conferencemember synced so we will listen for when the broadcast from the conference service
  $rootScope.$on("conferencemembers_updated",function(event,data){
      for(var i = 0; i < data.length;i++){
            // member dropped out
          if (data[i].xef001type == 'delete') {
            for (var m = 0; m < currentMembers.length; m++) {
              if (currentMembers[m].xpid == data[i].xpid) {
                //if the previous ring was active that means they refused the conference so we added them to a temporary list for this controller for members refused
                if(currentMembers[m].ring){

                	$scope.membersRefused.push(currentMembers[m]);
                }
                currentMembers.splice(m, 1);
                break;
              }
            }
          }else{

            //copy the members to temporary array 
          	if(data[i].fdpConferenceId = $scope.conference.xpid && data[i].contactId != $scope.meModel.my_pid){
          		currentMembers.push(data[i]);
          	}
          }

      }
  });
	// store recent
	storageService.saveRecent('conference', $scope.conferenceId);
	
	// update permission to view chat
	$scope.$on('conferencestatus_synced', function(event, data) {
		$scope.joined = $scope.conference.status.isMeJoined;
		$scope.enableChat = $scope.joined;
		$scope.enableTextInput = $scope.joined;
		$scope.enableFileShare = $scope.joined;
	});

	$scope.targetId = $scope.conferenceId;
	$scope.targetAudience = "conference";
	$scope.feed="conferences";
	$scope.targetType = "f.conversation.chat";
	$scope.cTabSelected = "CurrentCall";

  $scope.tabs = [{upper: $scope.verbage.current_call, lower: 'currentcall'}, 
  {upper: $scope.verbage.chat, lower: 'chat'}, {upper: $scope.verbage.recordings, lower: 'recordings'}];

  var getXpidInConf = $rootScope.$watch('myPid', function(newVal, oldVal){
      if (!$scope.globalXpid){
          $scope.globalXpid = newVal;
            
          if($routeParams.route != undefined){
            $scope.selected = $routeParams.route;
            localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);

            for(var i = 0; i < $scope.tabs.length;i++){
              if($scope.tabs[i].lower == $routeParams.route){
                $scope.toggleObject = {item: i};
                localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
              }
            }
          }else{
                $scope.selected = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
                $scope.toggleObject = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
          }

            getXpidInConf();
      } else {
          getXpidInConf();
      }
  });  
  
  // $scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;
  $scope.selected = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
  $scope.toggleObject = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};

  $scope.saveConfTab = function(tab, index){
      switch(tab){
          case "currentcall":
              $scope.selected = $scope.tabs[0].lower;
              localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
          case "chat":
              $scope.selected = $scope.tabs[1].lower;
              localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
          case "recordings":
              $scope.selected = $scope.tabs[2].lower;
              localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
      }
  };

  $scope.tabFilter = function(){
    return function(tab){
      if (tab.lower == 'recordings'){
        var recordingPerm = settingsService.getPermission('showCallCenter');
        if (recordingPerm)
          return true;
        else
          return false;
      }
      return true;
    };
  };

  $scope.removeRefused = function(member){
     for(var i = 0; i < $scope.membersRefused.length; i++){
     	if(member.xpid == $scope.membersRefused[i].xpid){
     		$scope.membersRefused.splice(i,1);
     	}
     }
  }

  $scope.searchContact = function(contact){
		if(contact){
			params = {
				conferenceId: $scope.conferenceId,
				contactId: contact.xpid
			}

			httpService.sendAction("conferences","joinContact",params);
		}
	};

  $scope.conferenceContact;

  $scope.addToConference = function(phoneNumber){
    params = {
      conferenceId: $scope.conferenceId,
      phone: phoneNumber
    }
    httpService.sendAction("conferences", "joinPhone", params);
  };

  $scope.clearRefused = function(){
	$scope.membersRefused.length = 0;
  }

  $scope.tryCallAll = function(){
  	var members = angular.copy($scope.membersRefused);
    for(var i = 0; i < members.length;i++){
      $scope.tryCall(members[i]);
    }
  }

  $scope.tryCall = function(member){
      if(member.fullProfile){
        $scope.searchContact(member.fullProfile);
      }else{
      	$scope.addToConference(member.phone);
      }

      $scope.removeRefused(member);
  }

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
	};
}]);