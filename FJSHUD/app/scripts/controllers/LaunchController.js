fjs.core.namespace("fjs.ui");

fjs.ui.LaunchController = function($rootScope, $scope, dataProvider) {
    fjs.ui.Controller.call(this, $scope);
	var app;

    var onLoaded = function() {
        if(meModel.getItemsCount()>0) {
            setTimeout(function(){
                meModel.removeEventListener("complete", onLoaded);
                var loading = document.getElementById("fj-loading");
                loading.style.display = "none";
            });
			
			$scope.launchApp();
        }
    };

    var meModel = dataProvider.getModel("me");
    meModel.addEventListener("complete", onLoaded);
	
	// open app in pop-up window
	$scope.launchApp = function() {
		app = window.open('app.html', "HUDweb", "scrollbars=yes, status=no, titlebar=no, toolbar=no, location=no, menubar=no, width=400, height=600");
		
		app.focus();
	};

    $scope.logout = function() {
		app.close();
        dataProvider.logout();
    };
};

fjs.core.inherits(fjs.ui.LaunchController, fjs.ui.Controller)