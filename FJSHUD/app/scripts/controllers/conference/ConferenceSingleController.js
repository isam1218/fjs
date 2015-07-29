hudweb.controller('ConferenceSingleController', ['$scope', '$rootScope', 'ConferenceService', 'HttpService', '$routeParams', 'SettingsService', 'StorageService', '$location',
	function($scope, $rootScope, conferenceService, httpService, $routeParams, settingsService, storageService, $location) {
	$scope.conversationType = 'conference';
	
	$scope.conferenceId = $routeParams.conferenceId;
	$scope.conference = conferenceService.getConference($scope.conferenceId);
	
	if($scope.conference.status){
		var isJoined = $scope.conference.status.isMeJoined;
	}
	$scope.joined = isJoined || false;

  $scope.membersRefused = [];
	

  $scope.joined = $scope.conference.status.isMeJoined;
  $scope.enableChat = $scope.joined;
  $scope.enableTextInput = $scope.joined;
  $scope.enableFileShare = $scope.joined;
	
   //var currentMembers = angular.copy($scope.conference.members);
  



  $scope.$watchCollection('conference.members', function(newValue,oldValue){
    	
   	  //we use scope watch to compare the new value vs the old value of the conference members  object attached to this scope
      for(var i = 0, iLen = oldValue.length; i < iLen; i++){
        var exists = false;
        //this is to verify if a member has dropped 
        for(var j = 0, jLen = newValue.length; j < jLen; j++){
          if(oldValue[i].contactId == newValue[j].contactId){
           exists = true;
            break;
          }
          if(oldValue[i].xpid == newValue[j].xpid){
           exists = true;
            break;
          }
        }
        if(!exists){
            //if the oldvalue was ring it means the previous state of the conference call was ringing and if that member doesn't exist now as part of the conference we can assume he decline the conference invitation
            if(oldValue[i].ring && !oldValue[i].fullProfile.call){
                var refuseMembersExists = false;
                for(var j = 0, jLen = $scope.membersRefused.length; j < jLen; j++){

                  //we verify by the contactId attached to the member because the xpid changes everytime a user joins a conference
                  if(oldValue[i].contactId && $scope.membersRefused[j].contactId){
                      if(oldValue[i].contactId == $scope.membersRefused[j].contactId){
                        refuseMembersExists = true;
                        $scope.membersRefused.splice(j,1,oldValue[i]);
                        break;
                      }  
                  }
                  
                }

                if(!refuseMembersExists)
                  $scope.membersRefused.push(oldValue[i]);
            }
        }
      }

      for(var i = 0,iLen = newValue.length; i < iLen;i++){
   	  	for(var j = 0, jLen = $scope.membersRefused.length; j < jLen;j++){
   	  		if(newValue[i].contactId == $scope.membersRefused[j].contactId){
   	  			$scope.membersRefused.splice(j,1);
            jLen--;
   	  		}	
   	  	}
   	  }
  });

	// store recent
	storageService.saveRecent('conference', $scope.conferenceId);
	
	// update permission to view chat
	$scope.$on('conferencestatus_synced', function(event, data) {
		if($scope.conference.status){
			var isJoined = $scope.conference.status.isMeJoined;
		}
		$scope.joined = isJoined || false;
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

  settingsService.getSettings().then(function() {
    if($routeParams.route != undefined){
      $scope.selected = $routeParams.route;
      for(var i = 0, iLen = $scope.tabs.length; i < iLen; i++){
        if($scope.tabs[i].lower == $routeParams.route){
          $scope.toggleObject = {item: i};
          break;
        }
      }
      var endPath = "/conference/" + $routeParams.conferenceId + "/" + $scope.selected;
      $location.path(endPath);
      localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
      localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
    }else{
      $scope.selected = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $rootScope.myPid]) : $scope.tabs[0].lower;
      $scope.toggleObject = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $rootScope.myPid]) : {item: 0};
      var endPath = "/conference/" + $routeParams.conferenceId + "/" + $scope.selected;
      $location.path(endPath);
    }
  }); 

  $scope.saveConfTab = function(tab, index){
      $scope.selected = tab;
      $scope.toggleObject = {item: index};
      localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
      localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
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
     for(var i = 0, iLen = $scope.membersRefused.length; i < iLen; i++){
     	if(member.xpid == $scope.membersRefused[i].xpid){
     		$scope.membersRefused.splice(i,1);
        iLen--;
     	}
     }
  };

  $scope.searchContact = function(contact){
		if(contact){
			var params = {
				conferenceId: $scope.conferenceId,
				contactId: contact.xpid
			};

			httpService.sendAction("conferences","joinContact",params);
		}
	};

  $scope.conferenceContact;

  $scope.addExternalToConference = function(phoneNumber){
    var params = {
      conferenceId: $scope.conferenceId,
      phone: phoneNumber
    };
	
    httpService.sendAction("conferences", "joinPhone", params);
  };

  $scope.clearRefused = function(){
	$scope.membersRefused.length = 0;
  };

  $scope.tryCallAll = function(){
  	var members = angular.copy($scope.membersRefused);
    for(var i = 0, iLen = members.length; i < iLen; i++){
      $scope.tryCall(members[i]);
    }
  };

  $scope.tryCall = function(member){
      if(member.fullProfile){
        $scope.searchContact(member.fullProfile);
      }else{
      	$scope.addExternalToConference(member.phone);
      }

      $scope.removeRefused(member);
  };

  $scope.joinConference = function(){
		var params;
		
		if($scope.joined){
			params = {
				conferenceId:$scope.conferenceId
			};
			
			httpService.sendAction("conferences",'leave',params);
		}else{
			params = {
				conferenceId: $scope.conferenceId,
				contactId: $scope.meModel.my_pid,
			};

			httpService.sendAction("conferences","joinContact",params);			
		}
	};

  $scope.permissionToInvite = function(){
    // permission to invite others to conference === 0, otherwise no permission
    return $scope.conference.permissions === 0;
  };

}]);
