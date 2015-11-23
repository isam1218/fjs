hudweb.controller('FileShareOverlayController', ['$scope', '$location', '$sce', 'HttpService', 'PhoneService', function($scope, $location, $sce, httpService, phoneService) {
	$scope.embedType = 'img';
	$scope.reposts = [];
	
	var updateEmbed = function() {
		var url = $scope.currentDownload.fileName;
		
		// google doc
		if (url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i))
			$scope.embedType = 'doc';
		// plain text
		else if (url.match(/\.(txt|js)$/i))
			$scope.embedType = 'text';
		// img
		else if (url.match(/\.(png|jpg|jpeg|gif)$/i))
			$scope.embedType = 'img';
		// video
		else if (url.match(/\.mp4$/i))
			$scope.embedType = 'video';
		// audio
		else if (url.match(/\.(mp3|wav)$/i))
			$scope.embedType = 'audio';
		// other
		else 
			$scope.embedType = 'misc';
	};
	
	if ($scope.$parent.overlay.data.audience) {
		var data = $scope.$parent.overlay.data;
		
		$scope.toName = data.name;
		$scope.targetId = data.xpid;
		$scope.audience = data.audience;
		
		// repost?
		if (data.original) {
			$scope.message = data.original.message;
			$scope.reposts = data.original.data.attachment;
		}
	}
	else {
		$scope.downloadables = $scope.$parent.overlay.data.downloadables;
		$scope.currentDownload = $scope.downloadables[$scope.$parent.overlay.data.current];
		
		updateEmbed();
	}

    $scope.archiveOptions = [
    	{name:'Never', value:0},
    	{name: 'in 3 Hours', value:10800000},
    	{name: 'in 2 Days', value:172800000},
    	{name: "in a Week", value:604800000},
    ];

    $scope.selectedArchiveOption = $scope.archiveOptions[0];
    
	$scope.update = function(archiveObject){
    	$scope.selectedArchiveOption = archiveObject;
    };

    $scope.getPreviewIcon = function(url, fileName){
		// show image as is
		if (fileName.match(/\.(png|jpg|jpeg|gif)$/i))
			return httpService.get_attachment(url, fileName);
		// show document image
		else if (fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|js)$/i))
			return 'img/XIcon-PreviewDocument.png';
		// show mysterious image
		else
			return 'img/XIcon-UnknownDocument.png';
    };
	
	$scope.getEmbedURL = function(url) {
		// sanitize url for iframe embedding
		if ($scope.embedType == 'doc')
			return $sce.trustAsResourceUrl('https://docs.google.com/viewer?url=' + encodeURIComponent(httpService.get_attachment(url)) + '&embedded=true&attredirects=0&d=1');
		else
			return $sce.trustAsResourceUrl(httpService.get_attachment(url) + '?embedded=true');
	};
	
	$scope.getDownloadURL = function(url) {
		return httpService.get_attachment(url);
	};

    $scope.uploadAttachments = function($files){
      	var fileList = [];
		
      	for (var i in $files){
      		fileList.push($files[i].file);
      	}
		
		if (fileList.length > 0 || $scope.reposts.length > 0) {
			var data = {
				'action':'sendWallEvent',
				'a.targetId': $scope.targetId,
				'a.type':'f.conversation.wall',
				'a.xpid':"",
				'a.archive':$scope.selectedArchiveOption.value,
				'a.retainKeys':"",
				'a.message': this.message ? this.message : '',
				'a.callback':'postToParent',
				'a.audience':$scope.audience,
				'alt':"",
				"a.lib":"https://huc-v5.fonality.com/repository/fj.hud/1.3/res/message.js",
				"a.taskId": "1_0",
				"_archive": $scope.selectedArchiveOption.value,
			};
			
			// add repost keys
			if ($scope.reposts.length > 0) {
				var xkeys = [];
				
				for (var i = 0, len = $scope.reposts.length; i < len; i++)
					xkeys.push($scope.reposts[i].xkey);
				
				data['action'] = 'republish';
				data['a.retainKeys'] = xkeys.join(',');
				data['a.xpid'] = $scope.$parent.overlay.data.original.xpid;
			}
		
			httpService.upload_attachment(data, fileList);
		
			// play sfx
			phoneService.playSound("sent");
		}
		else if (this.message && this.message != '') {
			// send as normal chat
			httpService.sendAction('streamevent', 'sendConversationEvent', {
				type: 'f.conversation.chat',
				audience: $scope.audience,
				to: $scope.targetId,
				message: this.message
			});
		
			// play sfx
			phoneService.playSound("sent");
		}
		
        this.message = "";
        $scope.upload.flow.cancel();
        $scope.$parent.showOverlay(false);
		
		// go to chat page
        $location.path('/' + $scope.audience + '/' + $scope.targetId + '/chat');
    };

	$scope.selectCurrentDownload = function(download){
		$scope.currentDownload = download;
		
		updateEmbed();
	};

	$scope.getOffsetDownload = function(index){
		var nextIndex = $scope.downloadables.indexOf($scope.currentDownload) + index;
		
		if(nextIndex > $scope.downloadables.length - 1){
			nextIndex = 0;
		}
		else if(nextIndex < 0){
			nextIndex = $scope.downloadables.length - 1;
		}

		$scope.currentDownload = $scope.downloadables[nextIndex];
		
		updateEmbed();
	};
	
    $scope.$on("$destroy", function() {
		
    });
}]);
