hudweb.controller('CallsRecordingsController', ['$scope', '$routeParams', '$location', function($scope, $routeParams, $location) {
	// routing
	$scope.tabs = [{upper: $scope.verbage.call_log_tab, lower: 'calllog'}, {upper:$scope.verbage.voicemail_tab, lower: 'voicemails'}, {upper: $scope.verbage.my_recordings_tab, lower: 'recordings'}];
	
	$scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;

}]);