fjs.core.namespace("fjs.ui");

fjs.ui.MainController = function($rootScope, $scope, dataProvider) {
    fjs.ui.Controller.call(this, $scope);
	$rootScope.stackables = [];
	$rootScope.myPid = null;

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

				$rootScope.myPid = meModel.getMyPid();

				// ask to turn on notifications
              if (Notification) {
                Notification.requestPermission(function (status) {
                  if (Notification.permission !== status)
                    Notification.permission = status;
                });
              }
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

	// add another chat panel
	$scope.loadPanel = function(panel) {
		var xpid = panel.xpid;
		var feed = panel.feedName.replace(/s$/g,"");
		panel.events = 0;

		if (window.location.href.indexOf('popup.html') != -1) {
			// popup opens chat in same window
			window.location.hash = '#/' + panel.feedName + '/' + xpid;
		}
		else {
			// resize window on first chat load
			if ($rootScope.stackables.length == 0 && document.body.clientWidth < 700)
				window.resizeTo(800, window.outerHeight);

			for (var i = $rootScope.stackables.length-1; i >= 0; i--) {
				if ($rootScope.stackables[i].id == xpid)
					return;
			}

			$rootScope.stackables.push({id: xpid, tab: feed});
			$scope.$safeApply();
		}
	};

	// remove chat panel
	$scope.removePanel = function(xpid) {
		for (var i = $rootScope.stackables.length-1; i >= 0; i--) {
			if ($rootScope.stackables[i].id == xpid) {
				$rootScope.stackables.splice(i, 1);
				$scope.$safeApply();
				break;
			}
		}

		// resize window on last chat removal
		if ($rootScope.stackables.length == 0 && document.body.clientWidth > 400)
			window.resizeTo(400, window.outerHeight);
	};

    $scope.logout = function() {
        dataProvider.logout();
    };
};

fjs.core.inherits(fjs.ui.MainController, fjs.ui.Controller)
