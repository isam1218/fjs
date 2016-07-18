hudweb.controller('VoicemailsController', ['$rootScope', '$scope', '$routeParams', 'GroupService', 'ContactService', 'HttpService', 'StorageService','PhoneService', 
	function($rootScope, $scope, $routeParams, groupService, contactService, httpService, storageService,phoneService) {

    $scope.voicemails = [];     
    $scope.query = "";
    $scope.vm = {
		query: '',
		opened: null
	};
    $scope.fromTo = false;
	
	// automatically open corresponding voicemail
	if ($rootScope.vmToOpen) {
		$scope.vm.opened = $rootScope.vmToOpen;
		$rootScope.vmToOpen = null;
	}
	
	$scope.$on('vmToOpen', function(event, data) {
		$scope.vm.opened = data;
	});

    $scope.voice_options = [
        {display_name:$scope.verbage.sort_alphabetically, type:"displayName", desc: false},
        {display_name:$scope.verbage.sort_newest_first, type:"date", desc: true},
        {display_name:$scope.verbage.sort_oldest_first, type:"date", desc: false},
        {display_name:$scope.verbage.sort_read_status, type:"readStatusNum", desc: false}
    ];

      // single group widget
    if ($routeParams.groupId) {
      var group = groupService.getGroup($routeParams.groupId);
      $scope.emptyVoiceLabel = group.name;
      $scope.selectedVoice = localStorage['Group_' + $routeParams.groupId + '_saved_voice_option_of_' + $rootScope.myPid] ? JSON.parse(localStorage['Group_' + $routeParams.groupId + '_saved_voice_option_of_' + $rootScope.myPid]) : $scope.voice_options[1];
    }
    // conversation widget
    else if ($routeParams.contactId) {
      var contact = contactService.getContact($routeParams.contactId);
      $scope.emptyVoiceLabel = contact.displayName;
      $scope.selectedVoice = localStorage['Conversation_' + $routeParams.contactId + '_saved_voice_option_of_' + $rootScope.myPid] ? JSON.parse(localStorage['Conversation_' + $routeParams.contactId + '_saved_voice_option_of_' + $rootScope.myPid]) : $scope.voice_options[1];
    }
    // calls & recordings
    else{
      $scope.emptyVoiceLabel = 'anyone else';
      $scope.selectedVoice = localStorage.saved_voice_option ? JSON.parse(localStorage.saved_voice_option) : $scope.voice_options[1];
    }
    
    $scope.sortBy = function(selectedVoice){
        $scope.selectedVoice = selectedVoice;
        if ($routeParams.contactId){
          localStorage['Conversation_' + $routeParams.contactId + '_saved_voice_option_of_' + $rootScope.myPid] = JSON.stringify($scope.selectedVoice);
        } else if ($routeParams.groupId){
          localStorage['Group_' + $routeParams.groupId + '_saved_voice_option_of_' + $rootScope.myPid] = JSON.stringify($scope.selectedVoice);
        } else {
          localStorage.saved_voice_option = JSON.stringify($scope.selectedVoice);  
        }
    };

    $scope.actions = [
		{display_name:$scope.verbage.action, type:"unknown"},
		{display_name:$scope.verbage.mark_all_incoming_vm_read, type:"read"},
		{display_name:$scope.verbage.mark_all_incoming_vm_unread, type:"unread"},
		{display_name:$scope.verbage.delete_all_incoming_read, type:"delete"},
    ];

    $scope.actionObj = {};
    $scope.actionObj.selectedAction = $scope.actionObj.currentAction = $scope.actions[0];
            	
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
        var query = $scope.vm.query.toLowerCase();
        return function(voicemail){
            if (voicemail.displayName.toLowerCase().indexOf(query) !== -1 || voicemail.phone.indexOf(query) !== -1 ){
                return true;
            }
            if (voicemail.fullProfile !== null && voicemail.fullProfile.primaryExtension.indexOf(query) !== -1){
              return true;
            }
        };
    
    };

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
	
	$scope.shortenText = function(txt) {
		if (txt.length < 130)
			return txt;
		else
			return txt.substring(0, 130) + '...';
	};
	
	// button actions //
    $scope.callExtension = function(contact) {
        ga('send', 'event', {eventCategory:'Calls', eventAction:'Place', eventLabel: "Calls/Recordings - Voicemail - Call"});
        phoneService.holdCalls();
        httpService.sendAction('me', 'callTo', {phoneNumber: contact.phone});
		storageService.saveRecent('contact', contact.xpid);
	};
	
	$scope.updateStatus = function(vm) {
		if (vm.readStatus === true)
			httpService.sendAction('voicemailbox', 'setReadStatus', {'read': false, id: vm.xpid});
		else
			httpService.sendAction('voicemailbox', 'setReadStatus', {'read': true, id: vm.xpid});
	};
	
	$scope.deleteFile = function(vm) {
		httpService.sendAction('voicemailbox', 'delete', {id: vm.xpid});
	};
	
	$scope.downloadFile = function(vm) {
		var path = httpService.get_audio('vm_download?id=' + vm.voicemailMessageKey);
		document.getElementById('download_file').setAttribute('src', path);
	};
}]);
