hudweb.controller('VoicemailsController', ['$rootScope', '$scope', '$routeParams', 'GroupService', 'ContactService', 'HttpService', function($rootScope, $scope, $routeParams, groupService, contactService, httpService) {
    $scope.voicemails = [];     
    $scope.query = "";
    $scope.tester = {};
    $scope.tester.query = "";
	
	// user's profile for their own voicemails
	contactService.getContacts().then(function() {
		$scope.myProfile = contactService.getContact($rootScope.myPid);
	});

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

	httpService.getFeed('me');
	httpService.getFeed('voicemailbox');
	
	$scope.$on('voicemailbox_synced', function(event, data) {		
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
				
				// populate voicemails according to page
				if (group) {
					for (var g = 0, gLen = group.members.length; g < gLen; g++) {
						if (data[i].contactId == group.members[g].contactId) {
							$scope.voicemails.push(data[i]);
							break;
						}
					}
				}
				else if (contact) {
					if (data[i].contactId == contact.xpid)
						$scope.voicemails.push(data[i]);
				}
				else {
					$scope.voicemails.push(data[i]);
				}
			}
		}
	});

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
            if (voicemail.displayName.toLowerCase().indexOf(query) !== -1 || voicemail.phone.indexOf(query) !== -1 || voicemail.fullProfile.primaryExtension.indexOf(query) !== -1){
                return true;
            }
        };
    
    };

    var MarkReadVoiceMails = function(isRead){
        voicemailIds = "";
        for (var i = 0; i < $scope.voicemails.length; i++) {
            xpid = $scope.voicemails[i].xpid;
            voicemailIds = voicemailIds.concat(xpid.toString() + ",");
        }        
        httpService.sendAction("voicemailbox","setReadStatusAll",{'read':isRead, ids: voicemailIds});
    };

    var DeleteReadVoiceMails = function(){
        voicemailIds = "";
        for (var i = 0; i < $scope.voicemails.length; i++) {
            if($scope.voicemails[i].readStatus){
                xpid = $scope.voicemails[i].xpid;
                voicemailIds = voicemailIds.concat(xpid.toString() + ",");
            }
        }
        httpService.sendAction("voicemailbox","removeReadMessages",{messages: voicemailIds});
    };
	
	// send to top navigation controller
	$scope.playVoicemail = function(voicemail) {
		$rootScope.$broadcast('play_voicemail', voicemail);
		
        httpService.sendAction("voicemailbox", "setReadStatusAll", {'read': true, ids: voicemail.xpid});
	};

}]);
