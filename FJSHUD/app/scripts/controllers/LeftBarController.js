hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'SettingsService', 'StorageService','$location', function($scope, $rootScope, httpService, phoneService, settingsService ,storageService,$location) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
    $scope.autoClearTime;
    $scope.autoClearOn;
    $scope.language = 'us';
    
	settingsService.getSettings().then(function(data) {		
		$scope.language =  $rootScope.language;
		$scope.$safeApply();
	});

	$rootScope.$on("mycalls_synced",function(event,data){
		console.log("DATA",data);
		
		$scope.calls_data = data;
		for(var i = 0; i<= data.length;i++){

		if($scope.calls_data[i] != undefined && $scope.calls_data[i].incoming == false){
		$scope.tab = 'recent';
		$location.path("settings/callid/"+data[i].xpid);
		}
		else if($scope.calls_data[i].type != 0 && $scope.calls_data[i].state == 2){

			$scope.tab = 'recent';
		$location.path("settings/callid/"+data[i].xpid);
		}
		}
	});
	
	$scope.setTab = function(tab) {
		$scope.tab = tab;
		$scope.query = '';
	};
	
	$scope.makeCall = function(number){
        phoneService.makeCall(number);
		storageService.saveRecentByPhone(number);
		$scope.number = '';

    };
}]);
