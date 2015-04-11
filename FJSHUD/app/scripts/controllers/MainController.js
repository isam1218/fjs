hudweb.controller('MainController', ['$rootScope', '$scope', '$timeout', 'HttpService','PhoneService', function($rootScope, $scope, $timeout, myHttpService, phoneService) {
	$rootScope.myPid = null;
	$rootScope.loaded = {all: false};
	
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
	
	// wait to show app
	var loadWatch = $rootScope.$watch('loaded', function(data) {
		var count = 0;
		
		for (key in data)
			count++;
		
		if (count >= 5) {
			$timeout(function() {
				$rootScope.loaded.all = true;
			}, 500);
			
			// kill watcher
			loadWatch();
		}
	}, true);

	// store user's xpid globally
	var getMyPid = $scope.$on('me_synced', function(event, data) {
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
			getMyPid();
	});

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
	
	$scope.queueStatusLabel = function(status) {
		switch(status) {
			case 'login-permanent':
				return 'Permanent in';
				break;
			case 'login':
				return $scope.verbage.logged_in;
				break;
			case 'logout':
				return $scope.verbage.Logged_out;
				break;
		}
	};

	$scope.formateGlobalDate = function(time){
		var formatter = Globalize('ja').dateFormatter({datetime:"MMMM d, h:mm a"});
		return formatter(new Date(time));
	}
	$scope.reloadPage = function(){
		window.onbeforeunload = function(){};
		myHttpService.logout();
	}

	$scope.$on('no_license',function(event,data){
		var data = {}
		setTimeout(function(){
			window.onbeforeunload = function(){};
			myHttpService.logout();
		},10000);

		$scope.showOverlay(true,'NoPermission',data);
	});
}]);
