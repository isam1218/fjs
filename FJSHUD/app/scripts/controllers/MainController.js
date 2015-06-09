hudweb.controller('MainController', ['$rootScope', '$scope', '$timeout', 'HttpService','PhoneService', function($rootScope, $scope, $timeout, myHttpService, phoneService) {
	$rootScope.myPid = null;
	$rootScope.loaded = false;
	
  $scope.number = "";
  $scope.currentPopup = {};
  $scope.currentPopup.url = null;
  $scope.currentPopup.x = 0;
  $scope.currentPopup.y = 0;
	$scope.pluginDownloadUrl = fjs.CONFIG.PLUGINS[$scope.platform];

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
	
	var activityTimeout = null;
	
	// wake status
	document.onmousemove = function() {
		if (!activityTimeout) {
			myHttpService.sendAction('useractivity', 'reportActivity', {});
			
			// prevent ajax call from firing too often
			activityTimeout = setTimeout(function() {
				activityTimeout = null;
			}, 10000);
		}
	};

	// store user's xpid globally
	var getMyPid = $scope.$on('me_synced', function(event, data) {
		if (!$rootScope.myPid) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].propertyKey == 'my_pid') {
					$rootScope.myPid = data[i].propertyValue;
					break;
				}
			}
		}
		else
			// remove watcher
			getMyPid();
	});

  var getMyXpid = $rootScope.$watch('myPid', function(newVal, oldVal){
    if (!$scope.gloablXpid){
      $scope.globalXpid = newVal;
      getMyXpid();      
    } else {
      getMyXpid();
    }
  });

    $scope.onBodyClick = function() {
        $scope.currentPopup.url = null;
        $scope.currentPopup.x = 0;
        $scope.currentPopup.y = 0;
        $scope.currentPopup.model = null;
        $scope.currentPopup.target = null;
    };

    $scope.broadcastDial = function(key){
        $scope.$broadcast("key_press",key);
    };
	
    $scope.makePhoneCall = function(type,$event){
    	switch(type){
    		case 'dialpad':
    			if ($event.keyCode == 13 && !$event.shiftKey) {
         			$scope.$broadcast("make_phone_call",$event);
    				$event.preventDefault();
				}
				break;
    	}
    };

    $scope.showPopup = function(data, target) {
        if(!data.key) {
            $scope.currentPopup.url = null;
            return;
        }
        else if($scope.currentPopup.url != "views/popups/"+data.key+".html") {
            $scope.currentPopup.url = "views/popups/" + data.key + ".html";
        }
        $scope.currentPopup.position = {top:data.y+"px", left:data.x+"px"};
        $scope.currentPopup.model = data.model;
        $scope.currentPopup.target = $(target).attr("type") ? $(target).attr("type") : '';
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
				return $scope.verbage.logged_out;
				break;
		}
	};

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
