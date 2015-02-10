hudweb.controller('ConferenceWidgetConversationController', ['$scope', 'ConferenceService', 'HttpService', '$routeParams', 'UtilService', 'ContactService', 'PhoneService',
	function($scope,conferenceService,httpService, $routeParams,utilService,contactService,phoneService) {
	$scope.conversationType = 'conference';

    $scope.enableChat = true;
    $scope.joined = false;
    $scope.cTabSelected = "CurrentCall";
	$scope.conferenceId = $routeParams.conferenceId;
	$scope.enableFileShare = false;
	httpService.getFeed("me");
	httpService.getFeed("conferencestatus")
	httpService.getFeed("conferencemembers");
	$scope.members = [];
	$scope.meModel = {};
	$scope.upload = {};
	$scope.conference = conferenceService.getConference($scope.conferenceId);
	$scope.showAttachments = false;
	$scope.formate_date = function(time){
        return utilService.formatDate(time,true);
    }
    
    $scope.update = function(archiveObject){
    	console.log(archiveObject);
    	$scope.selectedArchiveOption = archiveObject;
    }

    $scope.archiveOptions = [
    	{name:'Never',taskId:"2_6",value:0},
    	{name:'in 3 Hours', taskId:"2_3",value:10800000},
    	{name: 'in 2 Days', taskId:"2_4", value:172800000},
    	{name: "in a Week", taskId:"2_5", value:604800000},
    ]

    $scope.selectedArchiveOption = $scope.archiveOptions[0];


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

    $scope.getSingleAvatarUrl = function(xpid){
    	if(xpid){
    		return httpService.get_avatar(xpid,14,14);
    	}else{
    		return 'img/Generic-Avatar-14.png';
    	}
    }

    $scope.removeAttachment = function(file){

    	for(i in $flow.files){

    	}
    }
    $scope.uploadAttachments = function($files){
      	$files[0];
      	fileList = [];
      	for (i in $files){
      		fileList.push($files[i].file);
      	}
        data = {
            'action':'sendWallEvent',
            'a.targetId': $scope.conferenceId,
            'a.type':'f.conversation.wall',
            'a.xpid':"",
            'a.archive':$scope.selectedArchiveOption.value,
            'a.retainKeys':"",
            'a.taskId':"",
            'a.message':this.message,
            'a.callback':'postToParent',
            'a.audience':'conference',
            'alt':"",
            "a.lib":"https://huc-v5.fonality.com/repository/fj.hud/1.3/res/message.js",
            "a.taskId": "1_0",
            "_archive": $scope.selectedArchiveOption.value,
        }
        httpService.upload_attachment(data,fileList);
		
        this.message = "";
        $scope.upload.flow.cancel();
        $scope.showFileShareOverlay(false);
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
		$scope.addDetails();
	});
	
	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		conferenceMessages = [];
		for(key in data){
			message = data[key];
			contactId = message.context.split(":")[1]
			if( contactId == $scope.conferenceId ){
				conferenceMessages.push(data[key]);
			}
		}
		$scope.messages = $scope.messages.concat(conferenceMessages);
		$scope.addDetails();
	});
	
	// apply name and avatar
	$scope.addDetails = function() {
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
	};

	$scope.showFileShareOverlay = function(toShow){
		$scope.showAttachments = toShow;
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
	}

	$scope.searchContact = function(contact){
		if(contact){
			params = {
				conferenceId: $scope.conferenceId,
				contactId: contact.xpid
			}

			httpService.sendAction("conferences","joinContact",params);
		}
	}

    $scope.sendMessage = function() {
		if (this.message == '')
			return;
			
		var data = {
			type: 'f.conversation.chat',
			audience: 'conference',
			to: $scope.conferenceId,
			message: this.message,
		};
		
		httpService.sendAction('streamevent', 'sendConversationEvent', data);
		
		this.message = '';
	};

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
    		$scope.$safeApply();
    	}
   	});

   	$scope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }
		$scope.$apply();
    });


}]);