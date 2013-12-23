namespace("fjs.ui");

fjs.ui.LeftBarCallsController = function($scope) {
    fjs.ui.ControllerBase.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var myCallsModel = dataProvider.getModel("mycalls");
    $scope.calls = myCallsModel.order;
    $scope.number = "";
    $scope.call = function() {
        dataProvider.sendAction("me", "callTo", {"a.phoneNumber":$scope.number});
        $scope.number = "";
    };

    var callinput = document.getElementById("callinput");
    callinput.addEventListener("keyup", function(e){
        if(e.keyCode == 13) {
            $scope.call();
        }
    }, false);
};

fjs.ui.LeftBarCallsController.extends(fjs.ui.ControllerBase);