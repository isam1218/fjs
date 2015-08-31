hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'StorageService', function($scope, $rootScope, httpService, phoneService, storageService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
    $scope.autoClearTime;
    $scope.autoClearOn;
	$scope.language =  localStorage.fon_lang_code.split(".")[1];
	
	$scope.setTab = function(tab) {
		$scope.tab = tab;
		$scope.query = '';
	};
	
	$scope.makeCall = function(number){
        phoneService.makeCall(number);
		storageService.saveRecentByPhone(number);
		$scope.number = '';
    };

    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for (var i = 0, iLen = data.length; i < iLen; i++) {
                $scope.locations[data[i].xpid] = data[i];
            }
        }
    });
}]);
