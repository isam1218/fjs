namespace("fjs.ui");

fjs.ui.MainController = function($scope, dataProvider) {
    fjs.ui.Controller.call(this, $scope);

    $scope.currentPopup = {};
    $scope.currentPopup.url = null;
    $scope.currentPopup.x = 0;
    $scope.currentPopup.y = 0;

    var onLoaded = function() {
        if(meModel.order.length>0) {
            meModel.removeListener("complete", onLoaded);
            var loading = document.getElementById("fj-loading");
            loading.style.display = "none";
        }
    }


    var meModel = dataProvider.getModel("me");
    meModel.addListener("complete", onLoaded);

    $scope.onBodyClick = function() {
        $scope.currentPopup.url = null;
        $scope.currentPopup.x = 0;
        $scope.currentPopup.y = 0;
    };

    $scope.$on('showPopup', function(event, data) {
        if(!data.key) {
            $scope.currentPopup.url = null;
            return;
        }
        $scope.currentPopup.url = "templates/"+data.key+".html";
        $scope.currentPopup.x = data.x;
        $scope.currentPopup.y = data.y;
    });

    $scope.logout = function() {
        dataProvider.logout();
    };
};

fjs.ui.MainController.extend(fjs.ui.Controller);