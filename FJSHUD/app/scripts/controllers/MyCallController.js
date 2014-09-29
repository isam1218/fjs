fjs.core.namespace("fjs.ui");

fjs.ui.MyCallController = function($scope, $timeout, $filter, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var durationTimer = null;
    var timeSync = null;//new fjs.utils.TimeSync();
    var dataProvider = dataManager;
    var onDurationTimeout = function() {
        var date = new Date();
        var time =  date.getTime() +  (new Date(1).getTimezoneOffset() * 1000 * 60);
        var timeDur = time - $scope.call["created"];
        var timeHoldDur = time - $scope.call["holdStart"];

        $scope.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        $scope.call.duration = date.getTime() - ($scope.call["created"]);
        if($scope.call.state == 3)   {
            $scope.holdDuration = $filter('date')(new Date(timeHoldDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, 1000);
    };

    onDurationTimeout();

    $scope.$on("$destroy", function() {
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
    });



    $scope.hold = function($event) {
        $event.stopPropagation();
        dataProvider.sendAction("mycalls", "transferToHold", {"mycallId":$scope.call.xpid});
        return false;
    };
    $scope.unhold = function($event) {
        $event.stopPropagation();
        dataProvider.sendAction("mycalls", "transferFromHold", {"mycallId":$scope.call.xpid});
        return false;
    };
    $scope._accept = function($event) {
        $event.stopPropagation();
        dataProvider.sendAction("mycalls", "accept", {"mycallId":$scope.call.xpid});
        return false;
    };
    $scope.hangup = function($event) {
        $event.stopPropagation();
        dataProvider.sendAction("mycalls", "hangup", {"mycallId":$scope.call.xpid});
        return false;
    };
    $scope.park = function($event) {
        $event.stopPropagation();
        dataProvider.sendAction("mycalls", "transferToPark", {"mycallId":$scope.call.xpid});
        return false;
    };
    $scope.record = function($event) {
        $event.stopPropagation();
        if(!$scope.call.record) {
            dataProvider.sendAction("mycalls", "startRecord", {"mycallId": $scope.call.xpid});
        }
        else {
            dataProvider.sendAction("mycalls", "stopRecord", {"mycallId": $scope.call.xpid});
        }
        return false;
    };
};
fjs.core.inherits(fjs.ui.MyCallController, fjs.ui.Controller)