hudweb.controller('MainController', ['$rootScope', '$scope', '$timeout', '$q', 'HttpService','SettingsService', 'ContactService', function($rootScope, $scope, $timeout, $q, myHttpService, settingsService, contactService) {
	$rootScope.myPid = null;	
	
	$scope.number = "";
	$scope.currentPopup = {};
	$scope.currentPopup.url = null;
	$scope.currentPopup.x = 0;
	$scope.currentPopup.y = 0;
	$scope.pluginDownloadUrl = $scope.browser != 'Chrome' ? fjs.CONFIG.PLUGINS[$scope.platform] : fjs.CONFIG.PLUGINS[$scope.platform + "_NEW"];
	$scope.downloadModal = false;

	var hudnDownloadNotification = localStorage.hudnDownloadNotification ? JSON.parse(localStorage.hudnDownloadNotification) : false;

	if (!hudnDownloadNotification){
		$scope.downloadModal = true;
	}

	function isMac() {
		return navigator.platform.indexOf('Mac') > -1;
	}

	$scope.closeDownloadModal = function(){
		// close modal
		$scope.downloadModal = false;
		// save this user as someone who's received the hudn d/l notice already -> no future popups
		localStorage.hudnDownloadNotification = JSON.stringify(true);
	};

	$scope.openDownloadHudModal = function(){
		$scope.downloadModal = true;
	}

	$scope.downloadHudn = function() {
		$scope.downloadModal = false;
		// d/l link url depends on platform...
		var hudnDownloadUrl = isMac() ? fjs.CONFIG.PLUGINS.MAC_HUDN : fjs.CONFIG.PLUGINS.WINDOWS_HUDN;
		window.open(hudnDownloadUrl);
		$scope.closeDownloadModal();
	};

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
	
	var activityTimeout;
	
	$q.all([settingsService.getSettings(), contactService.getContacts()]).then(function() {
		// show app
		$timeout(function() {
			angular.element(document.getElementById('AppLoading')).remove();
			console.timeEnd('render');
			
			myHttpService.setUnload();
	
			// wake status
			document.onmousemove = function() {
				if (!activityTimeout) {
					myHttpService.sendAction('useractivity', 'reportActivity', {});
					
					// prevent ajax call from firing too often
					activityTimeout = setTimeout(function() {
						activityTimeout = null;
					}, fjs.CONFIG.ACTIVITY_DELAY);
				}
			};
		}, 3000, false);
	});

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

    $scope.barge_call = function(call,bargeType){
    	var xpid = call.fullProfile.xpid;
    	myHttpService.sendAction('contacts', bargeType + 'Call', {contactId: xpid});
    	$scope.closePopup();
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
		
		// set up ability to close pop-up
		$('.PanelWrapper, .TopBar').bind('click', function() {
			$scope.closePopup();
			$scope.$digest();
		});
    };

    $scope.closePopup = function() {
        $scope.currentPopup.url = null;
        $scope.currentPopup.x = 0;
        $scope.currentPopup.y = 0;
        $scope.currentPopup.model = null;
        $scope.currentPopup.target = null;
		
		$('.PanelWrapper, .TopBar').unbind('click');
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
	};

	$scope.reload = function(){
		window.onbeforeunload = function(){};
		document.cookie = "tab=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
		location.reload();
	};

	$scope.closeError = function(){
		if(!$scope.isFirstSync){
			$scope.showOverlay(false);
		}
	};

	$scope.$on('no_license',function(event,data){
		var data = {};
		
		setTimeout(function(){
			window.onbeforeunload = function(){};
			myHttpService.logout();
		},10000);

		$scope.showOverlay(true,'NoPermission',data);
		$scope.$safeApply();

	});
}]);
