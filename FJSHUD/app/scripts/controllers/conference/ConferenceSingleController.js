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
	
   //var currentMembers = angular.copy($scope.conference.members);
  



  $scope.$watchCollection('conference.members', function(newValue,oldValue){
    	

      //we use scope watch to compare the new value vs the old value of the conference members  object attached to this scope
      for(var i = 0; i < oldValue.length; i++){
        var exists = false;
        //this is to verify if a member has dropped 
        for(var j = 0; j < newValue.length; j++){
          if(oldValue[i].xpid == newValue[j].xpid){
            exists = true;  
            break;
          }
        
        }
        if(!exists){
            //if the oldvalue was ring it means the previous state of the conference call was ringing and if that member doesn't exist now as part of the conference we can assume he decline the conference invitation
            if(oldValue[i].ring){
                var refuseMembersExists = false;
                for(var j = 0; j < $scope.membersRefused.length;j++){

                  //we verify by the contactId attached to the member because the xpid changes everytime a user joins a conference
                  if(oldValue[i].contactId && $scope.membersRefused[j].contactId){
                      if(oldValue[i].contactId == $scope.membersRefused[j].contactId){
                        refuseMembersExists = true;
                        $scope.membersRefused.splice(j,1,oldValue[i]);
                      }  
                  }
                  
                }

                if(!refuseMembersExists)
                  $scope.membersRefused.push(oldValue[i]);
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

	settingsService.getSettings().then(function() {
        $scope.globalXpid = $rootScope.myPid;
          
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

  $scope.addToConference = function(phoneNumber){
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
    for(var i = 0; i < members.length;i++){
      $scope.tryCall(members[i]);
    }
  };

  $scope.tryCall = function(member){
      if(member.fullProfile){
        $scope.searchContact(member.fullProfile);
      }else{
      	$scope.addToConference(member.phone);
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
}]);