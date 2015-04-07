hudweb.controller('CallsRecordingsController', ['$scope', '$routeParams', '$location', function($scope, $routeParams, $location) {
	// routing
	$scope.tabs = [{upper: 'Call Log', lower: 'calllog'}, {upper: 'Voicemails', lower: 'voicemails'}, {upper: 'My Recordings', lower: 'recordings'}];
	
	$scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;

}]);