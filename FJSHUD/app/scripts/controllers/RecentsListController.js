fjs.core.namespace("fjs.ui");

fjs.ui.RecentsListController = function($scope, $rootScope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("widget_history");
    $scope.resents = $scope.model.items;
	var notify;

    var oncomplete = function() {
		$rootScope.$broadcast("updateRecent", $scope.resents);
        $scope.$safeApply();

		// notification
		if (!document.hasFocus() && notify == null) {
			notify = new Notification("New Activity",  {
				icon: '/app/img/Generic-Avatar-Small.png',
				tag: 'note',
				body: 'Click here to view contacts'
			});
			notify.onclick = function() {
				document.location = "#/contacts";
				$rootScope.$broadcast("updateRecent", $scope.resents);
				window.focus();
			};

			setTimeout(function() {
				notify.close();
				notify = null;
			}, 5000);
		}
    };

    $scope.model.addEventListener('complete', oncomplete);
};

fjs.core.inherits(fjs.ui.RecentsListController, fjs.ui.Controller);
