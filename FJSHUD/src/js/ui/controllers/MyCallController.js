namespace("fjs.ui");

fjs.ui.MyCallController = function($scope, $timeout, $filter) {
    fjs.ui.ControllerBase.call(this, $scope);
    var durationTimer = null;
    var timeSync = new fjs.TimeSync();
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var onDurationTimeout = function() {
        var date = new Date();
        var time =  date.getTime()-  timeSync.getDefault() + (new Date(1).getTimezoneOffset() * 1000 * 60);
        var timeDur = time - $scope.call.created;
        var timeHoldDur = time - $scope.call.holdStart;

        $scope.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        $scope.call.duration = date.getTime()- ($scope.call.created + timeSync.getDefault());
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



    $scope.hold = function() {
        dataProvider.sendAction("mycalls", "transferToHold", {"a.mycallId":$scope.call.xpid});
    };
    $scope.unhold = function() {
        dataProvider.sendAction("mycalls", "transferFromHold", {"a.mycallId":$scope.call.xpid});
    };
    $scope.accept = function() {
        dataProvider.sendAction("mycalls", "accept", {"a.mycallId":$scope.call.xpid});
    };
    $scope.hangup = function() {
        dataProvider.sendAction("mycalls", "hangup", {"a.mycallId":$scope.call.xpid});
    };
};
fjs.ui.MyCallController.extends(fjs.ui.ControllerBase);