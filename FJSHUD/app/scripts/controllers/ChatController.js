hudweb.controller('ChatController', ['$scope','HttpService', '$routeParams', 'UtilService', 'ContactService', 'PhoneService','$interval',
	function($scope,httpService, $routeParams,utilService,contactService,phoneService,$interval) {

	$scope.showAttachments = false;
	$scope.showDownloadAttachment = false;
	$scope.upload = {};
	var version = 0;
	$scope.glued = true;

	$scope.downloadables = [];
	$scope.currentDownload = {};
	 $scope.showFileShareOverlay = function(toShow){
		$scope.showAttachments = toShow;
	}

	 $scope.showDownloadAttachmentOverlay = function(toShow,imagetoDownload){
		var i = 0;
		for(i; i < $scope.messages.length;i++){
			if($scope.messages[i].data.attachment){
				addDownloadables($scope.messages[i].data.attachment);
			}
		}

		$scope.currentDownload = imagetoDownload;

		$scope.showDownloadAttachment = toShow;
	}

	$scope.selectCurrentDownload = function(download){
		$scope.currentDownload = download;
		$scope.$safeApply;
	}

	$scope.getOffsetDownload = function(index){
		var nextIndex = $scope.downloadables.indexOf($scope.currentDownload) + index
		if(nextIndex > $scope.downloadables.length - 1){
			nextIndex = 0;
		}else if(nextIndex < 0){
			nextIndex = $scope.downloadables.length - 1;
		}

		$scope.currentDownload = $scope.downloadables[nextIndex];
		
	}

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


    $scope.uploadAttachments = function($files){
      	$files[0];
      	fileList = [];
      	for (i in $files){
      		fileList.push($files[i].file);
      	}
        data = {
            'action':'sendWallEvent',
            'a.targetId': $scope.targetId,
            'a.type':'f.conversation.wall',
            'a.xpid':"",
            'a.archive':$scope.selectedArchiveOption.value,
            'a.retainKeys':"",
            'a.taskId':"",
            'a.message':this.message,
            'a.callback':'postToParent',
            'a.audience':$scope.targetAudience,
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


    $scope.getAttachment = function(url){
    	return httpService.get_attachment(url);
    }
    httpService.getChat($scope.feed,$scope.targetId).then(function(data) {
		version = data.h_ver;
		
		$scope.loading = false;
		$scope.messages = data.items;
		$scope.addDetails();
	});


   	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		for (key in data) {
			// prevent duplicates
			var dupe = false;
			
			for (i = 0; i < $scope.messages.length; i++) {
				if (data[key].xpid == $scope.messages[i].xpid) {
					dupe = true;
					break;
				}
			}
		

			if (dupe) continue;
			
			var from = data[key].from.replace('contacts:', '');
			var to = data[key].to ? data[key].to.replace('contacts:', '') : null;
			
			// only attach messages related to this user
			if (from == $scope.contactID || to == $scope.contactID){
				$scope.messages.push(data[key]);
				if(data[key].data.attachment){
					addDownloadables(data[key].data.attachment);
				}
			}

		}
		
		addDetails();
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


	
	$scope.sendMessage = function() {
		if (this.message == '')
			return;
			
		var data = {
			type: $scope.targetType,
			audience: $scope.targetAudience,
			to: $scope.targetId,
			message: this.message,
		};
		
		httpService.sendAction('streamevent', 'sendConversationEvent', data);
		
		this.message = '';
	};

	// look for enter key
	$scope.chatKeypress = function($event) {
		if ($event.keyCode == 13 && !$event.shiftKey) {
			this.sendMessage();
			$event.preventDefault();
		}
	};

	
	$scope.searchChat = function(increment) {
		var spans = document.querySelectorAll(".highlighted");
			
		if ($scope.query != '' && spans.length > 0) {			
			// temporarily disable sticky directive
			$scope.glued = false;
				
			var searchIndex = -1;
			
			for (i = 0; i < spans.length; i++) {
				if (spans[i].className.indexOf('found') != -1)
					searchIndex = i;
				
				spans[i].className = 'highlighted';
			}
			
			searchIndex += increment;
			
			// loop
			if (searchIndex < 0)
				searchIndex = spans.length - 1;
			else if (searchIndex >= spans.length)
				searchIndex = 0;
				
			spans[searchIndex].className = 'highlighted found';
			spans[searchIndex].scrollIntoView();
		}
	};


	// apply name and avatar
	var addDetails = function() {
		// wait for sync to catch up
		contactService.getContacts().then(function(data) {
			for (i = 0; i < $scope.messages.length; i++) {
				for (key in data) {
					if (data[key].xpid == $scope.messages[i].from.replace($scope.feed +':', '')) {
						$scope.messages[i].avatar = data[key].getAvatar(28);
						$scope.messages[i].displayName = data[key].displayName;
						
					}
				}
			}
			
			$scope.$safeApply();
		});
	};
	
	var addDownloadables = function(attachments){
		var i = 0;
		for(i; i < attachments.length; i++){
			isDupe = false;
			for(j = 0; j < $scope.downloadables.length;j++){
					if(attachments[i].xkey == $scope.downloadables[j].xkey){
						isDupe = true;
						break;
					}
			}
			if(!isDupe){
				$scope.downloadables.push(attachments[i]);		
			}	
		}
	
		
	}

	var chatLoop = $interval(function() {	
		var scrollbox = document.getElementById('ListViewContent');
	
		// check scroll position
		if (!$scope.loading && $scope.messages.length > 0 && scrollbox.scrollTop == 0) {
			$scope.loading = true;
			
			// ping server
			httpService.getChat($scope.feed, $scope.targetId, version).then(function(data) {
				version = data.h_ver;
			
				$scope.loading = false;
				$scope.messages = data.items.concat($scope.messages);				
				addDetails();

				// bump scroll down
				if (scrollbox.scrollTop == 0)
					scrollbox.scrollTop = 100;
				
				// end of history
				if (version == -1)
					$interval.cancel(chatLoop);
			});
		}
	}, 500);
	$scope.$on("$destroy", function() {
		$interval.cancel(chatLoop);
    });	
}]);