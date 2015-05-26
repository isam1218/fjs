hudweb.controller('ConferenceSingleController', ['$scope', '$rootScope', 'ConferenceService', 'HttpService', '$routeParams', '$location', 'ContactService', 'PhoneService',
	function($scope, $rootScope, conferenceService, httpService, $routeParams, $location, contactService, phoneService) {
	$scope.conversationType = 'conference';
	
	$scope.conferenceId = $routeParams.conferenceId;
	$scope.conference = conferenceService.getConference($scope.conferenceId);
	$scope.joined = $scope.conference.status.isMeJoined;
    $scope.enableChat = $scope.joined;
    $scope.enableTextInput = $scope.joined;
    $scope.enableFileShare = $scope.joined;
	
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
            $scope.selected = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
            $scope.toggleObject = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
            getXpidInConf();
      } else {
          getXpidInConf();
      }
  });  

  $scope.$on('pidAdded', function(event, data){
      $scope.globalXpid = data.info;
      $scope.selected = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
      $scope.toggleObject = localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConferenceSingle_' + $routeParams.conferenceId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
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

   	$scope.searchContact = function(contact){
		if(contact){
			params = {
				conferenceId: $scope.conferenceId,
				contactId: contact.xpid
			}

			httpService.sendAction("conferences","joinContact",params);
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
	};
}]);