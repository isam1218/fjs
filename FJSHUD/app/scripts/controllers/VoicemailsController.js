hudweb.controller('VoicemailsController', ['$q','$rootScope', '$scope', '$routeParams', 'GroupService', 'ContactService', 'HttpService', 'StorageService','PhoneService', 
	function($q, $rootScope, $scope, $routeParams, groupService, contactService, httpService, storageService,phoneService) {
    $scope.voicemails = [];     
    $scope.query = "";
    $scope.tester = {};
    $scope.tester.query = "";

    	// single group widget
		if ($routeParams.groupId) {
			var group = groupService.getGroup($routeParams.groupId);
			$scope.emptyVoiceLabel = group.name;
		}
		// conversation widget
		else if ($routeParams.contactId) {
			var contact = contactService.getContact($routeParams.contactId);
			$scope.emptyVoiceLabel = contact.displayName;
		}
		// calls & recordings
		else
			$scope.emptyVoiceLabel = 'anyone else';

    $scope.voice_options = [
        {display_name:$scope.verbage.sort_alphabetically, type:"displayName", desc: false},
        {display_name:$scope.verbage.sort_newest_first, type:"date", desc: true},
        {display_name:$scope.verbage.sort_oldest_first, type:"date", desc: false},
        {display_name:$scope.verbage.sort_read_status, type:"readStatusNum", desc: false}
    ];

    $scope.selectedVoice = localStorage.saved_voice_option ? JSON.parse(localStorage.saved_voice_option) : $scope.voice_options[1];

    $scope.sortBy = function(selectedVoice){
        $scope.selectedVoice = selectedVoice;
        localStorage.saved_voice_option = JSON.stringify($scope.selectedVoice);
    };

    $scope.actions = [
		{display_name:$scope.verbage.action, type:"unknown"},
		{display_name:$scope.verbage.mark_all_incoming_vm_read, type:"read"},
		{display_name:$scope.verbage.mark_all_incoming_vm_unread, type:"unread"},
		{display_name:$scope.verbage.delete_all_incoming_read, type:"delete"},
    ];

    $scope.actionObj = {};
    $scope.actionObj.selectedAction = $scope.actionObj.currentAction = $scope.actions[0];
        
    // user's profile for their own voicemails
	contactService.getContacts().then(function() {
		$scope.myProfile = contactService.getContact($rootScope.myPid);
				
		switch($scope.actionObj.selectedAction.type){
		    case "unknown":
		    	$scope.actionObj.currentAction = $scope.actions[0];		    	
	            break;
	        case "read":
	        	$scope.actionObj.currentAction = $scope.actions[1];
	            MarkReadVoiceMails(true);
	            break;
	        case "unread":
	        	$scope.actionObj.currentAction = $scope.actions[2];
	            MarkReadVoiceMails(false);
	            break;
	        case "delete":
	        	$scope.actionObj.currentAction = $scope.actions[3];
	            DeleteReadVoiceMails();
	            break;
		} 
		
	});
	
	phoneService.getVm().then(function(data) {
		if (group || contact) {
			// voicemails need to be filtered down
			updateVoicemails(data);
			
			// set up listener
			$scope.$on('voicemailbox_synced', function() {
				phoneService.getVm().then(function(data2) {
					// refresh
					updateVoicemails(data2);
				});
			});
		}
		else
			// pass by reference
			$scope.voicemails = data;
	});
	
	var updateVoicemails = function(data) {		
		// populate voicemails according to page
		if (group) {
			$scope.voicemails = [];
			
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				for (var g = 0, gLen = group.members.length; g < gLen; g++) {
					if (data[i].contactId == group.members[g].contactId) {
						$scope.voicemails.push(data[i]);
						break;
					}
				}
			}
			
		}
		else if (contact) {
			$scope.voicemails = data.filter(function(voicemail){
				return voicemail.contactId == contact.xpid;
			});
		}
	};

	$scope.handleVoiceMailAction = function(type){
        $scope.actionObj.selectedAction = $scope.actions[0];
        switch(type){
            case "read":
                $scope.actionObj.currentAction = $scope.actions[1];
                MarkReadVoiceMails(true);
                break;
            case "unread":
                $scope.actionObj.currentAction = $scope.actions[2];
                MarkReadVoiceMails(false);
                break;
            case "delete":
                $scope.actionObj.currentAction = $scope.actions[3];
                DeleteReadVoiceMails();
                break;
        }
    };

    $scope.voiceFilter = function(){
        var query = $scope.tester.query.toLowerCase();
        return function(voicemail){
            if (voicemail.displayName.toLowerCase().indexOf(query) !== -1 || voicemail.phone.indexOf(query) !== -1 ){
                return true;
            }
            if (voicemail.fullProfile !== null && voicemail.fullProfile.primaryExtension.indexOf(query) !== -1){
              return true;
            }
        };
    
    };
    $rootScope.$on('voicemailbox_synced', function(event, data) {
    	// first time
		if ($scope.voicemails.length == 0) {
			$scope.voicemails = data.filter(function(item){
				return item.xef001type != "delete"; 
			});
			
			// add full profile
			for (var v = 0, vLen = $scope.voicemails.length; v < vLen; v++) {
				$scope.voicemails[v].fullProfile = contactService.getContact($scope.voicemails[v].contactId);
			}	
		}
		else {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				var match = false;
				
				for (var v = 0, vLen = $scope.voicemails.length; v < vLen; v++) {
					// find and update or delete
					if ($scope.voicemails[v].xpid == data[i].xpid) {
						if (data[i].xef001type == 'delete') {
							$scope.voicemails.splice(v, 1);
							vLen--;
						}
						else
							$scope.voicemails[v].readStatus = data[i].readStatus;
						
						match = true;
						break;
					}
				}
				
				if (!match && data[i].xef001type != 'delete') {
					data[i].fullProfile = contactService.getContact(data[i].contactId);
					$scope.voicemails.push(data[i]);

				}
			}
		}
    });
    var MarkReadVoiceMails = function(isRead){
        var voicemailIds = "";
        for (var i = 0, iLen = $scope.voicemails.length; i < iLen; i++) {
            xpid = $scope.voicemails[i].xpid;
            voicemailIds = voicemailIds.concat(xpid.toString() + ",");
        }        
        httpService.sendAction("voicemailbox","setReadStatusAll",{'read':isRead, ids: voicemailIds});
    };

    var DeleteReadVoiceMails = function(){
        var voicemailIds = "";
        for (var i = 0, iLen = $scope.voicemails.length; i < iLen; i++) {
            if($scope.voicemails[i].readStatus){
                var xpid = $scope.voicemails[i].xpid;
                voicemailIds = voicemailIds.concat(xpid.toString() + ",");
            }
        }
        httpService.sendAction("voicemailbox","removeReadMessages",{messages: voicemailIds});
    };
	
	// send to top navigation controller
	$scope.playVoicemail = function(voicemail) {
		$rootScope.$broadcast('play_voicemail', voicemail);
	};

  $scope.callExtension = function($event, contact) {
    $event.stopPropagation();
    $event.preventDefault();
    
    httpService.sendAction('me', 'callTo', {phoneNumber: contact.phone});
  
    storageService.saveRecent('contact', contact.xpid);
  };


}]);
