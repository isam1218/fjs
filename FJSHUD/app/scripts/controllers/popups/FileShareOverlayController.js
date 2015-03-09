hudweb.controller('FileShareOverlayController', ['$scope', '$rootScope', 'ContactService', 'HttpService', function($scope, $rootScope, contactService, httpService) {
	if ($scope.$parent.overlay.data.audience) {
		$scope.toName = $scope.$parent.overlay.data.name;
		$scope.targetId = $scope.$parent.overlay.data.xpid;
		$scope.audience = $scope.$parent.overlay.data.audience;
	}
	else {
		$scope.downloadables = $scope.$parent.overlay.data.downloadables;
		$scope.currentDownload = $scope.downloadables[$scope.$parent.overlay.data.current];
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

    $scope.getAttachment = function(url){
    	return httpService.get_attachment(url);
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
        }
        httpService.upload_attachment(data,fileList);
		
        this.message = "";
        $scope.upload.flow.cancel();
        $scope.$parent.showOverlay(false);
    };

	$scope.selectCurrentDownload = function(download){
		$scope.currentDownload = download;
		$scope.$safeApply();
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
