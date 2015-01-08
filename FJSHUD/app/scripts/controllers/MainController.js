fjs.ui.MainController = function($rootScope, $scope, dataProvider, myHttpService) {
    fjs.ui.Controller.call(this, $scope);
	$rootScope.myPid = null;
	$rootScope.groups = false;

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
	
	// show contacts or groups tab
	// TO DO: make this more generic to allow switching between all tabs
	$rootScope.showGroups = function(groups) {
		$rootScope.groups = groups;
	};

    $scope.logout = function() {
        dataProvider.logout();
    };
};
