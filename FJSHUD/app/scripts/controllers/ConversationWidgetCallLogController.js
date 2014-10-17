/**
 * Created by fnf on 15.01.14.
 */fjs.core.namespace("fjs.ui");


fjs.ui.ConversationWidgetCallLogController = function($scope, $routeParams, $timeout, $filter, dataManager) {
    fjs.ui.Controller.call(this,  $scope, $routeParams.contactId, dataManager);
    var contactModel = dataManager.getModel("contacts"), durationTimer;
    $scope.contactId = $routeParams.contactId;
    $scope.contact = contactModel.items[$routeParams.contactId];
	
	// override data, where "stack" comes from ng-repeat
    if (typeof $scope.stack !== "undefined") {
		$scope.contactId = $scope.stack.id;
		$scope.contact = contactModel.items[$scope.stack.id];
	}
	
    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            updateFavicon();
            $scope.$safeApply();
        }
    };
    var onDurationTimeout = function() {
        if($scope.contact && $scope.contact.hasCall()) {
            var date = Date.now();
            var time = date + (new Date(1).getTimezoneOffset() * 1000 * 60);
            var timeDur = time - $scope.contact.calls_startedAt;
            $scope.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, 1000);
    };

    onDurationTimeout();

    contactModel.addEventListener("push", update);

    function updateFavicon() {
        var link = document.getElementById("favicon");
        if(link) {
            link.href = $scope.contact.getAvatarUrl(32,32);
            document.title= $scope.contact.displayName;
        }
    }


    $scope.$on("$destroy", function() {
        contactModel.removeEventListener("push", update);
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
    });
};

fjs.core.inherits(fjs.ui.ConversationWidgetCallLogController, fjs.ui.Controller)
