fjs.ui.MainController = function($rootScope, $scope, dataProvider, myHttpService) {
    fjs.ui.Controller.call(this, $scope);
	$rootScope.myPid = null;

    $scope.currentPopup = {};
    $scope.currentPopup.url = null;
    $scope.currentPopup.x = 0;
    $scope.currentPopup.y = 0;

    var _contextMenuWrap = document.getElementById('_contextMenuWrap');

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

    $scope.logout = function() {
        dataProvider.logout();
    };
};
