hudweb.controller('MainController', ['$rootScope', '$scope', 'HttpService','PhoneService', function($rootScope, $scope, myHttpService,phoneService) {
	$rootScope.myPid = null;
    $scope.number = "";
    $scope.currentPopup = {};
    $scope.currentPopup.url = null;
    $scope.currentPopup.x = 0;
    $scope.currentPopup.y = 0;
	
	$scope.overlay = {
		show: false,
		url: '',
		data: null
	};
	
	// prevents overlapping digest cycles
    $scope.$safeApply = function(fn) {
        var phase = $scope.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            if(fn && (typeof(fn) === 'function')) {
                $scope.$apply(fn);
            }
            else {
                $scope.$apply();
            }
        }
    };

    $scope.onBodyClick = function() {
        $scope.currentPopup.url = null;
        $scope.currentPopup.x = 0;
        $scope.currentPopup.y = 0;
        $scope.currentPopup.model = null;
    };

    $scope.broadcastDial = function(key){
        $scope.$broadcast("key_press",key);
    }

    $scope.getAvatar = function(pid,width,height){
        return myHttpService.get_avatar(pid,40,40);
    }


    $scope.showPopup = function(data) {
        if(!data.key) {
            $scope.currentPopup.url = null;
            return;
        }
        else if($scope.currentPopup.url != "views/popups/"+data.key+".html") {
            $scope.currentPopup.url = "views/popups/" + data.key + ".html";
        }
        $scope.currentPopup.position = {top:data.y+"px", left:data.x+"px"};
        $scope.currentPopup.model = data.model;
    };
	
	$scope.showOverlay = function(show, url, data) {
		$scope.overlay.show = show;
		$scope.overlay.url = url ? 'views/popups/' + url + '.html' : '';
		$scope.overlay.data = data ? data : null;
	};

	var getMyPid = $scope.$on('me_synced', function(event, data) {
		// find my pid
		if (!$rootScope.myPid) {
			for (key in data) {
				if (data[key].propertyKey == 'my_pid') {
					$rootScope.myPid = data[key].propertyValue;
					break;
				}
			}
		}
		else
			// remove watcher
			getMyPid = null;
	});
}]);
