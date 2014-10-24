fjs.core.namespace("fjs.ui");

fjs.ui.MainController = function($rootScope, $scope, dataProvider) {
    fjs.ui.Controller.call(this, $scope);
	$rootScope.stackables = [];

    $scope.currentPopup = {};
    $scope.currentPopup.url = null;
    $scope.currentPopup.x = 0;
    $scope.currentPopup.y = 0;

    var _contextMenuWrap = document.getElementById('_contextMenuWrap');

    var onLoaded = function() {
        if(meModel.getItemsCount()>0) {
            setTimeout(function(){
                meModel.removeEventListener("complete", onLoaded);
                var loading = document.getElementById("fj-loading");
                loading.style.display = "none";
            });
        }
    };


    var meModel = dataProvider.getModel("me");
    meModel.addEventListener("complete", onLoaded);

    $scope.onBodyClick = function() {
        $scope.currentPopup.url = null;
        $scope.currentPopup.x = 0;
        $scope.currentPopup.y = 0;
        $scope.currentPopup.model = null;
        _contextMenuWrap.style.display = 'none';
    };
    $scope.callPhone = function(number) {
        dataProvider.sendAction("me", "callTo", {"phoneNumber":number});
    };

    $scope.showMenu = function(data) {
        _contextMenuWrap.style.display = 'block';
        $scope.currentPopup.position = {top:data.y+"px", left:data.x+"px"};
        $scope.currentPopup.model = data.model;
        React.renderComponent(fjs.hud.react.ContextMenu({scope: $scope}), _contextMenuWrap);
    };

    $scope.showPopup = function(data) {
        if(!data.key) {
            $scope.currentPopup.url = null;
            return;
        }
        else if($scope.currentPopup.url != "views/"+data.key+".html") {
            $scope.currentPopup.url = "views/" + data.key + ".html";
        }
        $scope.currentPopup.position = {top:data.y+"px", left:data.x+"px"};
        $scope.currentPopup.model = data.model;
    };
	
	// open app in new pop-up window
	$scope.launchApp = function() {
		parent = window.open('index.html', "HUDweb", "scrollbars=yes, status=no, titlebar=no, toolbar=no, location=no, menubar=no, width=500, height=600");
		
		parent.focus();
	};
	
	// add another chat panel
	$scope.loadChat = function(contact) {
		// resize window on first chat load
		if ($rootScope.stackables.length == 0 && document.body.clientWidth < 700)
			window.resizeTo(800, window.outerHeight);
	
		var xpid = contact.xpid;
		
		for (var i = $rootScope.stackables.length-1; i >= 0; i--) {
			if ($rootScope.stackables[i].id == xpid)
				return;
		}
		
		$rootScope.stackables.push({id: xpid, tab: 'chat'});
		$scope.$safeApply();
	};
	
	// remove chat panel
	$scope.removeChat = function(xpid) {
		for (var i = $rootScope.stackables.length-1; i >= 0; i--) {
			if ($rootScope.stackables[i].id == xpid) {
				$rootScope.stackables.splice(i, 1);
				$scope.$safeApply();
				break;
			}
		}
		
		// resize window on last chat removal
		if ($rootScope.stackables.length == 0 && document.body.clientWidth > 500)
			window.resizeTo(500, window.outerHeight);
	};
	
	// switch tab within panel
	$rootScope.switchTab = function(xpid, tab) {
		for (var i = $rootScope.stackables.length-1; i >= 0; i--) {
			if ($rootScope.stackables[i].id == xpid) {
				$rootScope.stackables[i].tab = tab;
				$scope.$safeApply();
				break;
			}
		}
	};

    $scope.logout = function() {
        dataProvider.logout();
    };
};

fjs.core.inherits(fjs.ui.MainController, fjs.ui.Controller)