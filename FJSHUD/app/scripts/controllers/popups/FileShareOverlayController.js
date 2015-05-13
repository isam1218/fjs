hudweb.controller('FileShareOverlayController', ['$scope', '$location', '$sce', 'HttpService', function($scope, $location, $sce, httpService) {
	$scope.showEmbed = false;
	
	var toggleEmbed = function() {
		// show or hide iframe viewer
		if ($scope.currentDownload.fileName.match(/\.pdf$/i))
			$scope.showEmbed = true;
		else
			$scope.showEmbed = false;
	};
	
	if ($scope.$parent.overlay.data.audience) {
		$scope.toName = $scope.$parent.overlay.data.name;
		$scope.targetId = $scope.$parent.overlay.data.xpid;
		$scope.audience = $scope.$parent.overlay.data.audience;
	}
	else {
		$scope.downloadables = $scope.$parent.overlay.data.downloadables;
		$scope.currentDownload = $scope.downloadables[$scope.$parent.overlay.data.current];
		
		toggleEmbed();
	}

    $scope.archiveOptions = [
    	{name:'Never',taskId:"2_6",value:0},
    	{name:'in 3 Hours', taskId:"2_3",value:10800000},
    	{name: 'in 2 Days', taskId:"2_4", value:172800000},
    	{name: "in a Week", taskId:"2_5", value:604800000},
    ];

    $scope.selectedArchiveOption = $scope.archiveOptions[0];
    
	$scope.update = function(archiveObject){
    	$scope.selectedArchiveOption = archiveObject;
    };

    $scope.getAttachment = function(url,fileName){
    	return httpService.get_attachment(url);
    };
	
	$scope.getEmbedURL = function(url) {
		// sanitize url for iframe embedding
		return $sce.trustAsResourceUrl('https://docs.google.com/viewer?url=' + encodeURIComponent(httpService.get_attachment(url)) + '&embedded=true');
	};

    $scope.uploadAttachments = function($files){
      	$files[0];
      	fileList = [];
		
      	for (i in $files){
      		fileList.push($files[i].file);
      	}
		
        var data = {
            'action':'sendWallEvent',
            'a.targetId': $scope.targetId,
            'a.type':'f.conversation.chat',
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
		
        httpService.upload_attachment(data,fileList);
		
        this.message = "";
        $scope.upload.flow.cancel();
        $scope.$parent.showOverlay(false);
		
		// go to chat page if not already there
		if ($location.path().indexOf($scope.audience) == -1)
			$location.path('/' + $scope.audience + '/' + $scope.targetId);
    };

	$scope.selectCurrentDownload = function(download){
		$scope.currentDownload = download;
		
		toggleEmbed();
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
		
	};
	
    $scope.$on("$destroy", function() {
		
    });
}]);
