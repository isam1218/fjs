hudweb.controller('CallsRecordingsController', ['$scope', 'HttpService', 'ContactService',  function($scope, httpService, contactService) {	
	$scope.query = '';
	
	httpService.getFeed('calllog');
	
	$scope.$on('calllog_synced', function(event, data) {
		$scope.calls = data;
		
		angular.forEach($scope.calls, function(obj) {
			if (obj.contactId !== undefined)
				obj.contact = contactService.getContact(obj.contactId);
		});
		
		$scope.$safeApply();
	});
	
	$scope.customFilter = function() {
		var query = $scope.query.toLowerCase();
		
		return function(call) {
			if (query == '' || call.displayName.toLowerCase().indexOf(query) != -1 || call.phone.indexOf(query) != -1)
				return true;
		};
	};

    $scope.sortField = "displayName";
    $scope.sortReverse = false;

    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverse = false;
        }
        else {
            $scope.sortReverse = !$scope.sortReverse;
        }
    };
}]);