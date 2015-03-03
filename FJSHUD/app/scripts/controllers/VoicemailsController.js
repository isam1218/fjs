hudweb.controller('VoicemailsController', ['$rootScope', '$scope', '$routeParams', 'GroupService', 'ContactService', 'HttpService', 'UtilService', function($rootScope, $scope, $routeParams, groupService, contactService, httpService, utilService) {
    $scope.voicemails = [];     
    $scope.query = "";
    $scope.meModel = {};
        
    $scope.sort_options = [
		{display_name:"Alphabetically", type:"displayName", desc: false},
		{display_name:"Newest First", type:"date", desc: true},
		{display_name:"Oldest First", type:"date", desc: false},
		{display_name:"Read Status", type:"readStatus", desc: false}
    ];
    $scope.selectedSort = $scope.sort_options[1];
	
    $scope.actions = [
		{display_name:"Actions", type:"unknown"},
		{display_name:"Mark all incoming voicemails as read", type:"read"},
		{display_name:"Mark all incoming voicemails as unread", type:"unread"},
		{display_name:"Delete all read incoming voicemails", type:"delete"},
    ];
    $scope.selectedAction = $scope.actions[0];

	httpService.getFeed('me');
	httpService.getFeed('voicemailbox');
	
	$scope.$on('voicemailbox_synced', function(event, data) {
		$scope.voicemails = [];
		
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
		else {
			$scope.voicemails = data;
			$scope.emptyVoiceLabel = 'anyone else';
			$scope.$safeApply();
			return;
		}
		
		// populate voicemails according to page
		for (voicemail in data) {
			if (group) {				
				for (i = 0; i < group.members.length; i++) {
					if (data[voicemail].contactId == group.members[i].contactId)
						$scope.voicemails.push(data[voicemail]);
				}
			}
			else if (contact && data[voicemail].contactId == contact.xpid) {
                    $scope.voicemails.push(data[voicemail]);
			}
		}
		
		$scope.$safeApply();
	});

    $scope.sortBy = function(sort){
        $scope.selectedSort = sort;
    };
	
	$scope.getMeAvatarUrl = function(xpid,width,height){
        return httpService.get_avatar(xpid,width,height);
    };

    $scope.handleVoiceMailAction = function(type){
        switch(type){
            case "read":
                MarkReadVoiceMails(true);
                break;
            case "unread":
                MarkReadVoiceMails(false);
                break;
            case "delete":
                DeleteReadVoiceMails();
                break;
        }
    };

    var MarkReadVoiceMails = function(isRead){
        voicemailIds = "";
        for(voicemail in $scope.voicemails){
            xpid = $scope.voicemails[voicemail].xpid;
            voicemailIds = voicemailIds.concat(xpid.toString() + ",");
        }
		
        httpService.sendAction("voicemailbox","setReadStatusAll",{'read':isRead, ids: voicemailIds});
    };

    var DeleteReadVoiceMails = function(){
        voicemailIds = "";
        for(voicemail in $scope.voicemails){
            if($scope.voicemails[voicemail].readStatus){
                xpid = $scope.voicemails[voicemail].xpid;
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

    $scope.$on("me_synced",function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }
		
       $scope.$safeApply();
    });
}]);