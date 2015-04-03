hudweb.controller('CallsRecordingsController', ['$scope', '$location', function($scope, $location) {
	// routing
  $scope.selected = 'Call Log';
  $scope.tabs = [{upper: 'Call Log', lower: 'calllog'}, {upper: 'Voicemails', lower: 'voicemails'}];

  if ($location.path().indexOf('/voicemails') !== -1){
    $scope.selected = "Voicemails";
  } else if ($location.path().indexOf('/calllog') !== -1){
    $scope.selected = "Call Log";
  }
}]);